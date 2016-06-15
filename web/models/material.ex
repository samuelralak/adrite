defmodule Novel.Material do
  use Novel.Web, :model

  schema "materials" do
    field :name, :string
    field :cost, :float

    timestamps
  end

  @required_fields ~w(name cost)
  @optional_fields ~w()

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
  end
end
