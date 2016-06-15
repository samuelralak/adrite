defmodule Novel.Site do
  use Novel.Web, :model

  schema "sites" do
    field :name, :string
    field :location, :string
    field :total_square_meters, :integer
    field :agreed_amount, :float
    field :estimated_budget, :float
    field :description, :string
    field :internal_walls_measurement, :decimal
    field :ceilings_measurement, :decimal
    field :woodwork_measurement, :decimal
    field :metalwork_measurement, :decimal
    field :externalworks_measurement, :decimal
    has_many :site_sub_milestones, Novel.SiteSubMilestone, on_delete: :delete_all
    has_many :site_milestones, Novel.SiteMilestone, on_delete: :delete_all

    timestamps
  end

  @required_fields ~w(name location total_square_meters agreed_amount internal_walls_measurement ceilings_measurement woodwork_measurement metalwork_measurement externalworks_measurement)
  @optional_fields ~w(description estimated_budget)

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
