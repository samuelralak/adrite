defmodule Novel.LabourControlController do
  use Novel.Web, :controller

  alias Novel.LabourControl
  
  plug Guardian.Plug.EnsureAuthenticated, handler: Novel.GuardianErrorHandler

  plug :scrub_params, "labour_control" when action in [:create, :update]
  plug :fetch_labours when action in [:new, :create, :update, :edit]
  plug :assign_site_sub_milestone

  def index(conn, _params) do
    labour_controls = Repo.all(LabourControl)
    render(conn, "index.html", labour_controls: labour_controls)
  end

  def new(conn, _params) do
    changeset = 
    	conn.assigns[:site_sub_milestone]
    	|> build_assoc(:labour_controls)
    	|> LabourControl.changeset()
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"labour_control" => labour_controls_params}) do
    changeset = 
    	conn.assigns[:site_sub_milestone]
    	|> build_assoc(:labour_controls)
    	|> LabourControl.changeset(labour_controls_params)

    case Repo.insert(changeset) do
      {:ok, _labour_controls} ->
        conn
        |> put_flash(:info, "Labour controls created successfully.")
        |> redirect(to: site_sub_milestone_control_path(conn, :index, conn.assigns[:site_sub_milestone]))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    labour_controls = Repo.get!(LabourControl, id)
    render(conn, "show.html", labour_controls: labour_controls)
  end

  def edit(conn, %{"id" => id}) do
  	labour_controls = Repo.get!(assoc(conn.assigns[:site_sub_milestone], :labour_controls), id)
    changeset = LabourControl.changeset(labour_controls)
    render(conn, "edit.html", labour_controls: labour_controls, changeset: changeset)
  end

  def update(conn, %{"id" => id, "labour_control" => labour_controls_params}) do
    labour_controls = Repo.get!(assoc(conn.assigns[:site_sub_milestone], :labour_controls), id)
    changeset = LabourControl.changeset(labour_controls, labour_controls_params)

    case Repo.update(changeset) do
      {:ok, labour_controls} ->
        conn
        |> put_flash(:info, "Labour controls updated successfully.")
        |> redirect(to: site_sub_milestone_control_path(conn, :index, conn.assigns[:site_sub_milestone]))
      {:error, changeset} ->
        render(conn, "edit.html", labour_controls: labour_controls, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    labour_controls = Repo.get!(LabourControl, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(labour_controls)

    conn
    |> put_flash(:info, "Labour controls deleted successfully.")
    |> redirect(to: site_sub_milestone_control_path(conn, :index, conn.assigns[:site_sub_milestone]))
  end
  
  defp assign_site_sub_milestone(conn, _opts) do
  	case conn.params do
    	%{"site_sub_milestone_id" => site_sub_milestone_id} ->
    		site_sub_milestone = Repo.get(Novel.SiteSubMilestone, site_sub_milestone_id)
    		|> Repo.preload(:site)
    		|> Repo.preload(:sub_milestone)
    		case site_sub_milestone do
    			nil -> invalid_site_sub_milestone(conn)
    			site_sub_milestone -> assign(conn, :site_sub_milestone, site_sub_milestone)
      	end
    	_	-> invalid_site_sub_milestone(conn)
  	end
  end
  
  defp invalid_site_sub_milestone(conn) do
  	conn
  	|> put_flash(:error, "Invalid Sub Milestone!")
  	|> redirect(to: site_path(conn, :index))
  	|> halt
  end
  
  defp fetch_labours(conn, _opts) do
  	labours = Repo.all from m in Novel.Labour, select: {m.name, m.id}
  	assign(conn, :labours, labours)
  end
end
