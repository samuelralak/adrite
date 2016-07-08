defmodule Novel.ReportsView do
  use Novel.Web, :view
  use Number

  def week_totals(materials, labours) do
  	material_total = Enum.reduce(Map.values(materials), 0, fn(x, acc) ->  
  		value = if is_nil(Enum.at(x, 0)), do: 0.0, else: Enum.at(x, 0)
  		value + acc
  	end)

  	labour_total = Enum.reduce(Map.values(labours), 0, fn(x, acc) ->  
  		value = if is_nil(Enum.at(x, 0)), do: 0.0, else: Enum.at(x, 0)
  		value + acc
  	end)

  	total = material_total + labour_total

  	%{ material_total: material_total, labour_total: labour_total, total: total }
  end
end
