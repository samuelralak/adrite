defmodule Novel.SiteMeasurement do
  use Novel.Web, :model

  schema "site_measurements" do
    field :square_metres, :decimal
    field :price_per_square_metre, :float
    belongs_to :site, Novel.Site
    belongs_to :measurement, Novel.Measurement

    timestamps
  end

  @required_fields ~w(square_metres price_per_square_metre)
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
