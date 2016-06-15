defmodule Novel.DateHelpers do
	import Ecto
	
	use Phoenix.HTML
	use Timex
	
	
	def format_date(date, format) do
		if not is_nil(date) do
			{:ok, date} = Ecto.DateTime.dump(date)
		  Timex.Date.from(date)
		  |> Timex.Format.DateTime.Formatter.format!(format, :strftime)
		else
			""
		end
	end
end
