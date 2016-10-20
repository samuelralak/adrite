defmodule Novel.SiteController do
  use Novel.Web, :controller
  import Ecto.Query

  alias Novel.Site
  alias Novel.Milestone
  alias Novel.Measurement
  alias Novel.SiteMeasurement

  plug Guardian.Plug.EnsureAuthenticated, handler: Novel.GuardianErrorHandler

  plug :scrub_params, "site" when action in [:create, :update]

  def index(conn, _params) do
    sites = Site |> order_by(desc: :inserted_at) |> Repo.all
    render(conn, "index.html", sites: sites)
  end

  def new(conn, _params) do
    measurements = Repo.all(
      from m in Measurement, select: { m.name, m.id })
    site_measurements = Enum.reduce(0..4, [], fn(x, acc) ->
      List.insert_at(acc, x, %SiteMeasurement{})
    end)
    changeset = Site.changeset(%Site{ site_measurements: site_measurements })
    render(conn, "new.html", changeset: changeset, measurements: measurements)
  end

  def create(conn, %{"site" => site_params}) do
    changeset = Site.changeset(%Site{}, site_params)

    case Repo.insert(changeset) do
      {:ok, _site} ->
        site = _site
      	create_milestone(site)
        conn
        |> put_flash(:info, "Site created successfully.")
        |> redirect(to: site_path(conn, :index))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    site = Repo.get!(Site, id) |> Repo.preload(:site_milestones)
    render(conn, "show.html", site: site)
  end

  def edit(conn, %{"id" => id}) do
    site = Repo.get!(Site, id) |> Repo.preload(:site_measurements)
    changeset = Site.changeset(site)
    render(conn, "edit.html", site: site, changeset: changeset)
  end

  def update(conn, %{"id" => id, "site" => site_params}) do
    site = Repo.get!(Site, id)
    changeset = Site.changeset(site, site_params)

    case Repo.update(changeset) do
      {:ok, site} ->
      	create_milestone(site)
        conn
        |> put_flash(:info, "Site updated successfully.")
        |> redirect(to: site_path(conn, :show, site))
      {:error, changeset} ->
        render(conn, "edit.html", site: site, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    site = Repo.get!(Site, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(site)

    conn
    |> put_flash(:info, "Site deleted successfully.")
    |> redirect(to: site_path(conn, :index))
  end

  defp create_milestone(site) do
  	milestones = Repo.all(Milestone)
  	for milestone <- milestones do
  		changes = %{ milestone_id: milestone.id, site_id: site.id,
  			square_meters: milestone_measurement(milestone, site),
  			estimated_budget: assign_milestone_cost(milestone, site)
  		}
  		result =
				case Repo.get_by(Novel.SiteMilestone,
					%{ milestone_id: milestone.id, site_id: site.id }) do
						nil -> %Novel.SiteMilestone{}
						site_milestone -> site_milestone
				end
				|> Novel.SiteMilestone.changeset(changes)
				|> Repo.insert_or_update


  		case result do
  			{:ok, site_milestone} ->
  				sub_milestones = Repo.all(assoc(milestone, :sub_milestones))
  				for sub_milestone <- sub_milestones do
  					changes = %{site_id: site.id, site_milestone_id: site_milestone.id,
  						sub_milestone_id: sub_milestone.id, estimated_budget: assign_submilestone_cost(
  							milestone, site_milestone)
  					}
  					_result =
  						case Repo.get_by(Novel.SiteSubMilestone,
  							%{ sub_milestone_id: sub_milestone.id, site_id: site.id }) do
  								nil -> %Novel.SiteSubMilestone{}
  								site_sub_milestone -> site_sub_milestone
  						end
  						|> Novel.SiteSubMilestone.changeset(changes)
  						|> Repo.insert_or_update
  				end
  			{:error, changeset} -> IO.inspect changeset
  		end
  	end
  end

  defp milestone_measurement(milestone, site) do
  	name = milestone.name
  	measurement = Decimal.new(0)

  	case name do
  		"Surface Preparation" ->
  			measurement = Decimal.add(site.internal_walls_measurement, site.woodwork_measurement)
  			|> Decimal.add(site.ceilings_measurement)
  			|> Decimal.add(site.metalwork_measurement)
  			|> Decimal.add(site.externalworks_measurement)
  		"Filler Work" ->
  			measurement = Decimal.add(site.internal_walls_measurement, site.ceilings_measurement)
  			measurement
  		"Finishing" ->
  			measurement = Decimal.add(site.internal_walls_measurement, site.ceilings_measurement)
  			measurement
  		"External Works" ->
  			measurement = site.externalworks_measurement
  			measurement
  		"Metal Work & Wood Work" ->
  			measurement = Decimal.add(site.woodwork_measurement, site.metalwork_measurement)
  			measurement
  		_ ->
  			measurement
  	end
  end

  defp assign_milestone_cost(milestone, site) do
  	cost = site.estimated_budget
  	name = milestone.name

  	case name do
  		"Surface Preparation" ->
  			total_cost = 0.1 * cost
  			total_cost
  		"Filler Work" ->
  			total_cost = 0.35 * cost
  			total_cost
  		"Finishing" ->
  			total_cost = 0.25 * cost
  			total_cost
  		"External Works" ->
  			total_cost = 0.1 * cost
  			total_cost
  		"Metal Work & Wood Work" ->
  			total_cost = 0.1 * cost
  			total_cost
  		_ ->
  			total_cost = 0.1 * cost
  			total_cost
  	end
  end

  defp assign_submilestone_cost(milestone, site_milestone) do
  	count = Enum.count Repo.all(assoc(milestone, :sub_milestones))
  	cost = site_milestone.estimated_budget/count
  	cost
  end
end
