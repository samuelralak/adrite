defmodule Novel.Site do
  use Novel.Web, :model
  use Ecto.Model
  
  after_delete :delete_null_assoc

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
    has_many :site_measurements, Novel.SiteMeasurement
    has_many :site_sub_milestones, Novel.SiteSubMilestone, on_delete: :nilify_all
    has_many :site_milestones, Novel.SiteMilestone, on_delete: :nilify_all

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
    |> cast_assoc(:site_measurements, required: true)
  end
  
  def delete_null_assoc(site) do
  	ssm_ids = Novel.Repo.all(from ssm in Novel.SiteSubMilestone, where: is_nil(ssm.site_id), select: ssm.id)
  	
  	# delete labour controls
  	controls = from(c in Novel.LabourControl, where: c.site_sub_milestone_id in ^ssm_ids) 
  	|> Novel.Repo.delete_all
  			
  	# delete material controls
  	controls = from(c in Novel.MaterialControl, where: c.site_sub_milestone_id in ^ssm_ids) 
  	|> Novel.Repo.delete_all
  			
  	# delete controls
  	controls = from(c in Novel.Control, where: c.site_sub_milestone_id in ^ssm_ids) 
  	|> Novel.Repo.delete_all
  			
  	site_sub_milestones = from(ssm in Novel.SiteSubMilestone, where: ssm.id in ^ssm_ids)
  	|> Novel.Repo.delete_all
  	
  	query = from(sm in Novel.SiteMilestone, where: is_nil(sm.site_id))
  	|> Novel.Repo.delete_all
  	
  	site
  end
end
