defmodule Novel.Control do
  use Novel.Web, :model
	use Ecto.Model
	
	after_load :preload_associations
	
  schema "controls" do
    field :total_cost, :float
    belongs_to :site_sub_milestone, Novel.SiteSubMilestone
    has_many :labour_controls, Novel.LabourControl, on_delete: :delete_all
    has_many :material_controls, Novel.MaterialControl, on_delete: :delete_all

    timestamps
  end

  @required_fields ~w(total_cost)
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
  
  def preload_associations(control) do
    control |> Novel.Repo.preload([
    	:material_controls, :labour_controls, :site_sub_milestone])
  end
end
