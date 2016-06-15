defmodule Novel.SiteMilestoneController do
  use Novel.Web, :controller

  alias Novel.SiteMilestone
  
  plug Guardian.Plug.EnsureAuthenticated, handler: Novel.GuardianErrorHandler

  plug :scrub_params, "site_milestone" when action in [:create, :update]

  def index(conn, _params) do
    site_milestones = Repo.all(SiteMilestone)
    render(conn, "index.html", site_milestones: site_milestones)
  end

  def new(conn, _params) do
    changeset = SiteMilestone.changeset(%SiteMilestone{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"site_milestone" => site_milestone_params}) do
    changeset = SiteMilestone.changeset(%SiteMilestone{}, site_milestone_params)

    case Repo.insert(changeset) do
      {:ok, _site_milestone} ->
        conn
        |> put_flash(:info, "Site milestone created successfully.")
        |> redirect(to: site_milestone_path(conn, :index))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    site_milestone = 
    	Repo.get!(SiteMilestone, id)
    	|> Repo.preload(:site)
    	|> Repo.preload(:milestone)
    	|> Repo.preload(:site_sub_milestones)
    render(conn, "show.html", site_milestone: site_milestone)
  end

  def edit(conn, %{"id" => id}) do
    site_milestone = Repo.get!(SiteMilestone, id)
    |> Repo.preload(:site)
    |> Repo.preload(:milestone)
    changeset = SiteMilestone.changeset(site_milestone)
    render(conn, "edit.html", site_milestone: site_milestone, changeset: changeset)
  end

  def update(conn, %{"id" => id, "site_milestone" => site_milestone_params}) do
    site_milestone = Repo.get!(SiteMilestone, id)
    |> Repo.preload(:site)
    |> Repo.preload(:milestone)
    changeset = SiteMilestone.changeset(site_milestone, site_milestone_params)

    case Repo.update(changeset) do
      {:ok, site_milestone} ->
        conn
        |> put_flash(:info, "Site milestone updated successfully.")
        |> redirect(to: site_milestone_path(conn, :show, site_milestone))
      {:error, changeset} ->
        render(conn, "edit.html", site_milestone: site_milestone, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    site_milestone = Repo.get!(SiteMilestone, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    Repo.delete!(site_milestone)

    conn
    |> put_flash(:info, "Site milestone deleted successfully.")
    |> redirect(to: site_milestone_path(conn, :index))
  end
end
