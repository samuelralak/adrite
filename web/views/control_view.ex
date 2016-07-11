defmodule Novel.ControlView do
  use Novel.Web, :view
  
  import Ecto.Query
  alias Novel.Repo

  def total_on_labour(control) do
  	control_id = control.id
  	query = from lc in Novel.LabourControl, where: lc.control_id == ^control_id, select: sum(lc.total_cost)
  	Repo.all(query) |> Enum.at(0) 
  end

  def total_on_material(control) do
  	control_id = control.id
  	query = from mc in Novel.MaterialControl, where: mc.control_id == ^control_id, select: sum(mc.total_cost)
  	Repo.all(query) |> Enum.at(0) 
  end
end
