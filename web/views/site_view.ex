defmodule Novel.SiteView do
  use Novel.Web, :view
  use Number
  import Ecto
  alias Novel.Repo
  alias Novel.Milestone
  
  def get_milestone(site_milestone) do
  	Repo.get!(Milestone, site_milestone.milestone_id)
  end
end
