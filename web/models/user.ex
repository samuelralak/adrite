defmodule Novel.User do
  use Novel.Web, :model
  
  alias PhoenixGuardian.Repo

  schema "users" do
    field :name, :string
    field :email, :string
    field :password_digest, :string
    
    # Virtual Fields
  	field :password, :string, virtual: true
  	field :confirm_password, :string, virtual: true
  	field :current_password, :string, virtual: true

    timestamps
  end

  @required_fields ~w(name email password confirm_password)
  @optional_fields ~w()

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def create_changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
    |> hash_password
  end
  
  def update_changeset(model, params \\ :empty) do
    model
    |> cast(params, ~w(name email current_password), ~w(password confirm_password))
    |> validate_password
    |> verify_password
  end

  def login_changeset(model), do: model |> cast(%{}, ~w(), ~w(email password))

  def login_changeset(model, params) do
    model
    |> cast(params, ~w(email password), ~w())
  end
  
  defp hash_password(changeset) do
  	if password = get_change(changeset, :password) do
  	  changeset
  	  |> put_change(:password_digest, Comeonin.Bcrypt.hashpwsalt(password))
  	else
  		changeset
  	end
  end

  def valid_password?(nil, _), do: false
  def valid_password?(_, nil), do: false
  def valid_password?(password, crypted), do: Comeonin.Bcrypt.checkpw(password, crypted)

  defp maybe_update_password(changeset) do
    case Ecto.Changeset.fetch_change(changeset, :password) do
      { :ok, password } ->
        changeset
        |> Ecto.Changeset.put_change(:encrypted_password, Comeonin.Bcrypt.hashpwsalt(password))
      :error -> changeset
    end
  end
  
  def verify_password(changeset) do
  	if password = get_change(changeset, :password) do
  		confirm_password = get_change(changeset, :confirm_password)
  		
  		if password == confirm_password do
  			changeset
  	  	|> put_change(:password_digest, Comeonin.Bcrypt.hashpwsalt(password))
  		else
  			changeset
  			|> Ecto.Changeset.add_error(:confirm_password, "does not match password")
  		end
  	else
  		changeset
  	end
  end

  defp validate_password(changeset) do
    case Ecto.Changeset.get_field(changeset, :password_digest) do
      nil -> password_incorrect_error(changeset)
      crypted -> validate_password(changeset, crypted)
    end
  end

  defp validate_password(changeset, crypted) do
    if changeset.changes != %{} do
    	password = get_change(changeset, :current_password)
    	if valid_password?(password, crypted), do: changeset, else: password_incorrect_error(changeset)
    else
    	changeset
    end
  end

  defp password_incorrect_error(changeset), do: Ecto.Changeset.add_error(changeset, :current_password, "is incorrect")
end
