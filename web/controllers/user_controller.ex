defmodule Novel.UserController do
	use Novel.Web, :controller
	
	alias Novel.User
	
	plug Guardian.Plug.EnsureAuthenticated, handler: Novel.GuardianErrorHandler
	
	plug :scrub_params, "user" when action in [:update]
	
	def edit(conn, _params) do
		user = Guardian.Plug.current_resource(conn)
    changeset = User.update_changeset(user)
    render(conn, "edit.html", user: user, changeset: changeset)
	end
	
	def update(conn, %{"user" => user_params}) do
		user = Guardian.Plug.current_resource(conn)
    changeset = User.update_changeset(user, user_params)

    case Repo.update(changeset) do
      {:ok, _user} ->
        conn
        |> put_flash(:info, "User updated successfully.")
        |> redirect(to: user_path(conn, :edit))
      {:error, changeset} ->
        render(conn, "edit.html", user: user, changeset: changeset)
    end
	end
end
