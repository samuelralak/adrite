defmodule Novel.LabourController do
  use Novel.Web, :controller

  alias Novel.Labour
	
	plug Guardian.Plug.EnsureAuthenticated, handler: Novel.GuardianErrorHandler
	
  plug :scrub_params, "labour" when action in [:create, :update]

  def index(conn, _params) do
    labours = Repo.all(Labour)
    render(conn, "index.html", labours: labours)
  end

  def new(conn, _params) do
    changeset = Labour.changeset(%Labour{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"labour" => labour_params}) do
    changeset = Labour.changeset(%Labour{}, labour_params)

    case Repo.insert(changeset) do
      {:ok, _labour} ->
        conn
        |> put_flash(:info, "Labour created successfully.")
        |> redirect(to: labour_path(conn, :index))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    labour = Repo.get!(Labour, id)
    # render(conn, "show.html", labour: labour)
    json conn, Poison.encode!(labour)
  end

  def edit(conn, %{"id" => id}) do
    labour = Repo.get!(Labour, id)
    changeset = Labour.changeset(labour)
    render(conn, "edit.html", labour: labour, changeset: changeset)
  end

  def update(conn, %{"id" => id, "labour" => labour_params}) do
    labour = Repo.get!(Labour, id)
    changeset = Labour.changeset(labour, labour_params)

    case Repo.update(changeset) do
      {:ok, labour} ->
        conn
        |> put_flash(:info, "Labour updated successfully.")
        |> redirect(to: labour_path(conn, :show, labour))
      {:error, changeset} ->
        render(conn, "edit.html", labour: labour, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    labour = Repo.get!(Labour, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(labour)

    conn
    |> put_flash(:info, "Labour deleted successfully.")
    |> redirect(to: labour_path(conn, :index))
  end
end
