defmodule Novel.SiteSubMilestone do
  use Novel.Web, :model
  @derive {Poison.Encoder, only: [:start_date, :end_date, :notes, :cost, :is_completed]}

  schema "site_sub_milestones" do
    field :start_date, :string
    field :end_date, :string
    field :notes, :string
    field :cost, :float
    field :estimated_budget, :float
    field :is_completed, :boolean, default: false
    belongs_to :sub_milestone, Novel.SubMilestone
    belongs_to :site, Novel.Site
    belongs_to :site_milestone, Novel.SiteMilestone
		
		has_many :labour_controls, Novel.LabourControl, on_delete: :nilify_all
		has_many :material_controls, Novel.MaterialControl, on_delete: :nilify_all
		has_many :controls, Novel.Control, on_delete: :nilify_all
		
    timestamps
  end

  @required_fields ~w(site_id site_milestone_id sub_milestone_id)
  @optional_fields ~w(start_date end_date notes cost is_completed estimated_budget)

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
