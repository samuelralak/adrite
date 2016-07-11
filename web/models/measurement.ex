defmodule Novel.Measurement do
  use Novel.Web, :model

  schema "measurements" do
    field :name, :string
    field :code, :string
    field :is_active, :boolean, default: false
    has_many :site_measurements, Novel.SiteMeasurement

    timestamps
  end

  @required_fields ~w(name code is_active)
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
