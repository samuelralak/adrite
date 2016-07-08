defmodule Novel.ReportsController do
  use Novel.Web, :controller
  import Ecto.Query

  def show(conn, %{"id" => id}) do
    site_milestone = Repo.get!(Novel.SiteMilestone, id)
      |> Repo.preload(:site)
      |> Repo.preload(:milestone)
      |> Repo.preload(:site_sub_milestones)
  	sub_milestones = Repo.all(from ssm in Novel.SiteSubMilestone, 
  		where: ssm.site_milestone_id == ^id, select: ssm.id)
    current_date = Calendar.DateTime.now_utc

    if conn.query_params["week_number"] && conn.query_params["year"]  do
      week = conn.query_params["week_number"] |> String.to_integer
      year = conn.query_params["year"] |> String.to_integer
      week_number = [year, week] |> List.to_tuple
      current_week =  week_number |> Calendar.Date.dates_for_week_number
    else
      week_number = current_date |> Calendar.Date.week_number 
      current_week = week_number |> Calendar.Date.dates_for_week_number
      year = current_date |> Calendar.Strftime.strftime! "%Y"  
    end

  	labours = Enum.reduce current_week, %{}, fn date, acc ->  
  		labour = Repo.all(from lc in Novel.LabourControl, 
  			where: lc.date == ^date	and lc.site_sub_milestone_id in ^sub_milestones,
  			select: sum(lc.total_cost))
  		Map.put(acc, date, labour)
  	end

  	materials = Enum.reduce current_week, %{}, fn date, acc ->  
  		material = Repo.all(from mc in Novel.MaterialControl, 
  			where: mc.date == ^date	and mc.site_sub_milestone_id in ^sub_milestones,
  			select: sum(mc.total_cost))
  		Map.put(acc, date, material)
  	end

  	data = %{ current_date: current_date, current_week: current_week, site_milestone: site_milestone,
  		material: materials, labour: labours, week_number:  week_number |> Tuple.to_list |> Enum.at(1), 
      year: year }	

    render(conn, "show.html", data: data)
  end
end