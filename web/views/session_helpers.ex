defmodule Novel.SessionHelpers do
  
  def current_user(conn) do
  	Guardian.Plug.current_resource(conn)
	end
end
