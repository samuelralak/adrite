defmodule Novel.MaterialController do
  use Novel.Web, :controller

  alias Novel.Material
  
  plug Guardian.Plug.EnsureAuthenticated, handler: Novel.GuardianErrorHandler

  plug :scrub_params, "material" when action in [:create, :update]

  def index(conn, _params) do
    materials = Repo.all(Material)
    render(conn, "index.html", materials: materials)
  end

  def new(conn, _params) do
    changeset = Material.changeset(%Material{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"material" => material_params}) do
    changeset = Material.changeset(%Material{}, material_params)

    case Repo.insert(changeset) do
      {:ok, _material} ->
        conn
        |> put_flash(:info, "Material created successfully.")
        |> redirect(to: material_path(conn, :index))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    material = Repo.get!(Material, id)
    # render(conn, "show.html", material: material)
    json conn, Poison.encode!(material)
  end

  def edit(conn, %{"id" => id}) do
    material = Repo.get!(Material, id)
    changeset = Material.changeset(material)
    render(conn, "edit.html", material: material, changeset: changeset)
  end

  def update(conn, %{"id" => id, "material" => material_params}) do
    material = Repo.get!(Material, id)
    changeset = Material.changeset(material, material_params)

    case Repo.update(changeset) do
      {:ok, material} ->
        conn
        |> put_flash(:info, "Material updated successfully.")
        |> redirect(to: material_path(conn, :show, material))
      {:error, changeset} ->
        render(conn, "edit.html", material: material, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    material = Repo.get!(Material, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(material)

    conn
    |> put_flash(:info, "Material deleted successfully.")
    |> redirect(to: material_path(conn, :index))
  end
end
