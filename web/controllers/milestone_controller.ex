defmodule Novel.MilestoneController do
  use Novel.Web, :controller

  alias Novel.Milestone
	
	plug Guardian.Plug.EnsureAuthenticated, handler: Novel.GuardianErrorHandler
	
  plug :scrub_params, "milestone" when action in [:create, :update]

  def index(conn, _params) do
    milestones = Repo.all(Milestone)
    render(conn, "index.html", milestones: milestones)
  end

  def new(conn, _params) do
    changeset = Milestone.changeset(%Milestone{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"milestone" => milestone_params}) do
    changeset = Milestone.changeset(%Milestone{}, milestone_params)

    case Repo.insert(changeset) do
      {:ok, _milestone} ->
        conn
        |> put_flash(:info, "Milestone created successfully.")
        |> redirect(to: milestone_path(conn, :index))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    milestone = Repo.get!(Milestone, id)
    render(conn, "show.html", milestone: milestone)
  end

  def edit(conn, %{"id" => id}) do
    milestone = Repo.get!(Milestone, id)
    changeset = Milestone.changeset(milestone)
    render(conn, "edit.html", milestone: milestone, changeset: changeset)
  end

  def update(conn, %{"id" => id, "milestone" => milestone_params}) do
    milestone = Repo.get!(Milestone, id)
    changeset = Milestone.changeset(milestone, milestone_params)

    case Repo.update(changeset) do
      {:ok, milestone} ->
        conn
        |> put_flash(:info, "Milestone updated successfully.")
        |> redirect(to: milestone_path(conn, :show, milestone))
      {:error, changeset} ->
        render(conn, "edit.html", milestone: milestone, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    milestone = Repo.get!(Milestone, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(milestone)

    conn
    |> put_flash(:info, "Milestone deleted successfully.")
    |> redirect(to: milestone_path(conn, :index))
  end
end
