defmodule Novel.SessionController do
	use Novel.Web, :controller
	
	alias Novel.User
	
	plug :scrub_params, "user" when action in [:create]
	
	def new(conn, _params) do
		changeset = User.login_changeset(%User{})
		render conn, "new.html", changeset: changeset
	end
	
	def create(conn, %{"user" => %{"email" => email, "password" => password}}) 
		when not is_nil(email) and not is_nil(password) do
    user = Repo.get_by(User, email: email)
  	sign_in(user, password, conn)
  end
  
  def create(conn, _) do
  	failed_login(conn)
  end
  
  def delete(conn, _params) do
  	Guardian.Plug.sign_out(conn)
  	|> put_flash(:info, "Signed out successfully!")
  	|> redirect(to: session_path(conn, :new))
  end
  
  defp sign_in(user, password, conn) when is_nil(user) do
  	failed_login(conn)
	end
	
	defp sign_in(user, password, conn) do
  	if Comeonin.Bcrypt.checkpw(password, user.password_digest) do
    	conn
    	|> put_flash(:info, "Sign in successful!")
    	|> Guardian.Plug.sign_in(user, :token)
      |> redirect(to: site_path(conn, :index))
  	else
    	failed_login(conn)
  	end
	end
	
	defp failed_login(conn) do
  	conn
  	|> put_flash(:error, "Invalid username/password combination!")
  	|> redirect(to: session_path(conn, :new))
  	|> halt()
	end
end
