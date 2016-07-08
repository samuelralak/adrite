defmodule Novel.SiteMilestoneView do
  use Novel.Web, :view
  use Number
  import Ecto
  import Ecto.Query
  alias Novel.Repo
  alias Novel.Milestone
  alias Novel.SubMilestone
  
  def get_sub_milestone(site_sub_milestone) do
  	Repo.get!(SubMilestone, site_sub_milestone.sub_milestone_id)
  end
  
  def remove_unloaded(site_sub_milestone) do
  	site_sub_milestone
  	|> Map.delete(:site)
  	|> Map.delete(:site_milestone)
  	|> Map.delete(:sub_milestone)
  end
  
  def display_date(date) do
  	if is_nil(date) do
  		""
  	else
  		Ecto.DateTime.to_string(date)
  	end 
  end

  def display_date_time(date) do
    if is_nil(date) do
      ""
    else
      Ecto.Date.to_string(date)
    end 
  end
  
  def get_total_cost(site_sub_milestone) do
  	ssm_id = site_sub_milestone.id
  	query = from c in Novel.Control,
  		where: c.site_sub_milestone_id == ^ssm_id,
  		select: sum(c.total_cost)
  	Repo.all(query) |> Enum.at 0 
  end
  
  def change_style(estimated_budget, total_cost) do
  	if not is_nil(total_cost) do
  		if total_cost > estimated_budget, do: 'panel panel-danger', else: 'panel panel-default'
      if total_cost >= (90/100 * estimated_budget), do: 'panel panel-warning', else: 'panel panel-default'
  	else
  		'panel panel-default'
  	end
  end
  
  def add_style(estimated_budget, total_cost) do
  	if not is_nil(total_cost) do
  		if total_cost > estimated_budget, do: 'background-color: #f2dede; color: #a94442;'
      if total_cost >= (90/100 * estimated_budget), do: 'background-color: #faebcc;'
  	end
  end
end
