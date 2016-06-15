defmodule Novel.SubMilestone do
  use Novel.Web, :model

  schema "sub_milestones" do
    field :name, :string
    field :description, :string
    field :position, :integer
    belongs_to :milestone, Novel.Milestone
    has_many :site_sub_milestones, Novel.SiteSubMilestone

    timestamps
  end

  @required_fields ~w(name milestone_id position)
  @optional_fields ~w(description)

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
