defmodule Novel.MaterialControlController do
  use Novel.Web, :controller

  alias Novel.MaterialControl
  
  plug Guardian.Plug.EnsureAuthenticated, handler: Novel.GuardianErrorHandler

  plug :scrub_params, "material_control" when action in [:create, :update]
  plug :fetch_materials when action in [:new, :create, :update, :edit]
  plug :assign_site_sub_milestone

  def index(conn, _params) do
    material_controls = Repo.all(MaterialControl)
    render(conn, "index.html", material_controls: material_controls)
  end

  def new(conn, _params) do
    changeset = 
    	conn.assigns[:site_sub_milestone]
    	|> build_assoc(:material_controls)
    	|> MaterialControl.changeset()
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"material_control" => material_controls_params}) do
  	changeset = 
    	conn.assigns[:site_sub_milestone]
    	|> build_assoc(:material_controls)
    	|> MaterialControl.changeset(material_controls_params)

    case Repo.insert(changeset) do
      {:ok, _material_controls} ->
        conn
        |> put_flash(:info, "Material controls created successfully.")
        |> redirect(to: site_sub_milestone_control_path(conn, :index, conn.assigns[:site_sub_milestone]))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    material_controls = Repo.get!(MaterialControl, id)
    render(conn, "show.html", material_controls: material_controls)
  end

  def edit(conn, %{"id" => id}) do
    material_controls = Repo.get!(assoc(conn.assigns[:site_sub_milestone], :material_controls), id)
    changeset = MaterialControl.changeset(material_controls)
    render(conn, "edit.html", material_controls: material_controls, changeset: changeset)
  end

  def update(conn, %{"id" => id, "material_control" => material_controls_params}) do
    material_controls = Repo.get!(assoc(conn.assigns[:site_sub_milestone], :material_controls), id)
    changeset = MaterialControl.changeset(material_controls, material_controls_params)

    case Repo.update(changeset) do
      {:ok, _material_controls} ->
        conn
        |> put_flash(:info, "Material controls updated successfully.")
        |> redirect(to: site_sub_milestone_control_path(conn, :index, conn.assigns[:site_sub_milestone]))
      {:error, changeset} ->
        render(conn, "edit.html", material_controls: material_controls, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    material_controls = Repo.get!(MaterialControl, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(material_controls)

    conn
    |> put_flash(:info, "Material controls deleted successfully.")
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
  
  defp fetch_materials(conn, _opts) do
  	materials = Repo.all from m in Novel.Material, select: {m.name, m.id}
  	assign(conn, :materials, materials)
  end
end
