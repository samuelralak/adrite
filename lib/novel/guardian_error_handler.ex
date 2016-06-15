defmodule Novel.GuardianErrorHandler do
  import Novel.Router.Helpers

  def unauthenticated(conn, _params) do
    conn
    |> Phoenix.Controller.put_flash(:error, "You must be logged in.")
    |> Phoenix.Controller.redirect(to: session_path(conn, :new))
  end
end
