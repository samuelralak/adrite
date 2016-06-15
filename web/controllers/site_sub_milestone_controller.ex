defmodule Novel.SiteSubMilestoneController do
  use Novel.Web, :controller
  import Ecto.Query

  alias Novel.SiteSubMilestone
  
  plug Guardian.Plug.EnsureAuthenticated, handler: Novel.GuardianErrorHandler

  plug :scrub_params, "site_sub_milestone" when action in [:create, :update]

  def index(conn, _params) do
    site_sub_milestones = Repo.all(SiteSubMilestone)
    render(conn, "index.html", site_sub_milestones: site_sub_milestones)
  end

  def new(conn, _params) do
    changeset = SiteSubMilestone.changeset(%SiteSubMilestone{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"site_sub_milestone" => site_sub_milestone_params}) do
    changeset = SiteSubMilestone.changeset(%SiteSubMilestone{}, site_sub_milestone_params)

    case Repo.insert(changeset) do
      {:ok, _site_sub_milestone} ->
        conn
        |> put_flash(:info, "Site sub milestone created successfully.")
        |> redirect(to: site_sub_milestone_path(conn, :index))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    site_sub_milestone = Repo.get!(SiteSubMilestone, id)
    render(conn, "show.html", site_sub_milestone: site_sub_milestone)
  end

  def edit(conn, %{"id" => id}) do
    site_sub_milestone = Repo.get!(SiteSubMilestone, id)
    |> Repo.preload(:site)
    |> Repo.preload(:sub_milestone)
    |> Repo.preload(:site_milestone)
    changeset = SiteSubMilestone.changeset(site_sub_milestone)
    render(conn, "edit.html", site_sub_milestone: site_sub_milestone, changeset: changeset)
  end

  def update(conn, %{"id" => id, "site_sub_milestone" => site_sub_milestone_params}) do
    site_sub_milestone = Repo.get!(SiteSubMilestone, id)
    |> Repo.preload(:site)
    |> Repo.preload(:sub_milestone)
    |> Repo.preload(:site_milestone)
    changeset = SiteSubMilestone.changeset(site_sub_milestone, site_sub_milestone_params)

    case Repo.update(changeset) do
      {:ok, site_sub_milestone} ->
        conn
        |> put_flash(:info, "Site sub milestone updated successfully.")
        |> redirect(to: site_milestone_path(conn, :show, site_sub_milestone.site_milestone))
      {:error, changeset} ->
        render(conn, "edit.html", site_sub_milestone: site_sub_milestone, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    site_sub_milestone = Repo.get!(SiteSubMilestone, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(site_sub_milestone)

    conn
    |> put_flash(:info, "Site sub milestone deleted successfully.")
    |> redirect(to: site_sub_milestone_path(conn, :index))
  end
  
  def close(conn, %{"id" => id}) do
  	ssm = Repo.get!(SiteSubMilestone, id)
  	|> Ecto.Changeset.change(is_completed: true)
  	|> Repo.update!
  	ssm_id = ssm.site_milestone_id
  	
  	all_ssm = 
  		Enum.count(
  			SiteSubMilestone |> where(
  				[s], s.site_milestone_id == ^ssm_id) |> Repo.all)
  	completed_ssm = 
  		Enum.count(
  			SiteSubMilestone |> where(
  				[s], s.site_milestone_id == ^ssm_id and s.is_completed == true) |> Repo.all)
  			
  	progress = (completed_ssm/all_ssm) * 100
  	|> Float.floor
  	site_milestone = Repo.get(Novel.SiteMilestone, ssm_id)
  	
  	if progress == 100.0 do
  		site_milestone = Ecto.Changeset.change(site_milestone, %{
  			progress: progress, is_completed: true }) |> Repo.update
  	else
  		site_milestone = Ecto.Changeset.change(site_milestone, %{
  			progress: progress}) |> Repo.update
  	end
  	
  	json conn, Poison.encode! %{ progress: progress }
  end
end
