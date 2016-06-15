defmodule Novel.ControlController do
  use Novel.Web, :controller

  alias Novel.Control
	
	plug Guardian.Plug.EnsureAuthenticated, handler: Novel.GuardianErrorHandler
	
  plug :scrub_params, "control" when action in [:create, :update]
  plug :assign_site_sub_milestone

  def index(conn, _params) do
    controls = Repo.all(assoc(conn.assigns[:site_sub_milestone], :controls))
    IO.inspect controls
    render(conn, "index.html", controls: controls)
  end

  def new(conn, _params) do
    changeset = Control.changeset(%Control{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"control" => control_params}) do
    changeset = Control.changeset(%Control{}, control_params)

    case Repo.insert(changeset) do
      {:ok, _control} ->
        conn
        |> put_flash(:info, "Control created successfully.")
        |> redirect(to: site_sub_milestone_control_path(conn, :index, conn.assigns[:site_sub_milestone]))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    control = Repo.get!(assoc(conn.assigns[:site_sub_milestone], :controls), id)
    |> Repo.preload(:labour_controls)
    |> Repo.preload(:material_controls)
    render(conn, "show.html", control: control)
  end

  def edit(conn, %{"id" => id}) do
    control = Repo.get!(Control, id)
    changeset = Control.changeset(control)
    render(conn, "edit.html", control: control, changeset: changeset)
  end

  def update(conn, %{"id" => id, "control" => control_params}) do
    control = Repo.get!(Control, id)
    changeset = Control.changeset(control, control_params)

    case Repo.update(changeset) do
      {:ok, control} ->
        conn
        |> put_flash(:info, "Control updated successfully.")
        |> redirect(to: site_sub_milestone_control_path(conn, :show, conn.assigns[:site_sub_milestone], control))
      {:error, changeset} ->
        render(conn, "edit.html", control: control, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    control = Repo.get!(Control, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(control)

    conn
    |> put_flash(:info, "Control deleted successfully.")
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
end
