import Ecto.Query

alias Novel.Repo
alias Novel.User
alias Novel.Measurement

# Create admin
find_or_create_admin = fn data ->
	case Repo.all(from u in User, where: u.email == ^data.email) do
	  [] -> 
	  	%User{}
	  	|> User.changeset(%{name: data.name, email: data.email, password: data.password, confirm_password: data.confirm_password})
	  	|> Repo.insert!()
	  _ ->
	  	IO.puts "User with email #{data.email} already exists"  
	end
end

admin_data = %{name: "admin", email: "admin@adrite.com", password: "12345678", confirm_password: "12345678"}
_admin = find_or_create_admin.(admin_data)

# Create measurements
measurements = ["Internal Wall Measurement", "Ceilings Measurement", "Woodwork Measurement", 
	"Metalwork Measurement", "Externalworks Measurement"]

Enum.map(measurements, fn m ->  
	code = m |> String.upcase |> String.replace(" ", "-")

	case Repo.all(from m in Measurement, where: m.code == ^code) do
	  [] -> 
	  	%Measurement{}
	  	|> Measurement.changeset(%{ name: m, code: code, is_active: true })
	  	|> Repo.insert!()
	  _ ->
	  	IO.puts "Measurement: #{code} already exists"  
	end
end)