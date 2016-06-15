defmodule Novel.SubMilestoneController do
  use Novel.Web, :controller

  alias Novel.SubMilestone
	
	plug Guardian.Plug.EnsureAuthenticated, handler: Novel.GuardianErrorHandler
	
  plug :scrub_params, "sub_milestone" when action in [:create, :update]

  def index(conn, _params) do
    sub_milestones = Repo.all(SubMilestone)
    render(conn, "index.html", sub_milestones: sub_milestones)
  end

  def new(conn, _params) do
    changeset = SubMilestone.changeset(%SubMilestone{})
    milestones = Repo.all from m in Novel.Milestone, select: {m.name, m.id}
    render(conn, "new.html", milestones: milestones, changeset: changeset)
  end

  def create(conn, %{"sub_milestone" => sub_milestone_params}) do
    changeset = SubMilestone.changeset(%SubMilestone{}, sub_milestone_params)

    case Repo.insert(changeset) do
      {:ok, _sub_milestone} ->
        conn
        |> put_flash(:info, "Sub milestone created successfully.")
        |> redirect(to: sub_milestone_path(conn, :index))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    sub_milestone = Repo.get!(SubMilestone, id)
    render(conn, "show.html", sub_milestone: sub_milestone)
  end

  def edit(conn, %{"id" => id}) do
  	milestones = Repo.all from m in Novel.Milestone, select: {m.name, m.id}
    sub_milestone = Repo.get!(SubMilestone, id)
    changeset = SubMilestone.changeset(sub_milestone)
    render(conn, "edit.html", milestones: milestones, sub_milestone: sub_milestone, changeset: changeset)
  end

  def update(conn, %{"id" => id, "sub_milestone" => sub_milestone_params}) do
    sub_milestone = Repo.get!(SubMilestone, id)
    changeset = SubMilestone.changeset(sub_milestone, sub_milestone_params)

    case Repo.update(changeset) do
      {:ok, sub_milestone} ->
        conn
        |> put_flash(:info, "Sub milestone updated successfully.")
        |> redirect(to: sub_milestone_path(conn, :show, sub_milestone))
      {:error, changeset} ->
        render(conn, "edit.html", sub_milestone: sub_milestone, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    sub_milestone = Repo.get!(SubMilestone, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(sub_milestone)

    conn
    |> put_flash(:info, "Sub milestone deleted successfully.")
    |> redirect(to: sub_milestone_path(conn, :index))
  end
end
