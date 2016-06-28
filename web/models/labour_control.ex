defmodule Novel.LabourControl do
  use Novel.Web, :model
  use Ecto.Model
	
	after_load :preload_associations
	before_delete :change_control_cost

  schema "labour_controls" do
    field :no_of_days, :integer
    field :total_cost, :float
    belongs_to :labour, Novel.Labour
    belongs_to :control, Novel.Control
    belongs_to :site_sub_milestone, Novel.SiteSubMilestone

    timestamps
  end

  @required_fields ~w(no_of_days total_cost labour_id)
  @optional_fields ~w(control_id)

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
    |> assign_control
  end
  
  defp assign_control(changeset) do
  	site_sub_milestone_id = changeset.model.site_sub_milestone_id
  	
  	case Novel.Repo.get_by(Novel.Control, site_sub_milestone_id: site_sub_milestone_id) do
  		nil -> 
  			total_cost = get_change(changeset, :total_cost)
  			control = Novel.Repo.insert! %Novel.Control{
  				total_cost: total_cost, site_sub_milestone_id: site_sub_milestone_id }
  			changeset
  			|> put_change(:control_id, control.id)
  		control ->
  			if total_cost = get_change(changeset, :total_cost) do	
  				old_cost = default_for_nil(control.total_cost) - default_for_nil(changeset.model.total_cost)
  				new_cost = default_for_nil(old_cost) + default_for_nil(total_cost)
  				control = Ecto.Changeset.change(control, total_cost: new_cost) 
  				Novel.Repo.update control
  				
  				changeset
  				|> put_change(:control_id, control.model.id)
  			else
  				changeset
  			end		
  	end
  end
  
  defp default_for_nil(value) do
  	if is_nil(value), do: 0.0, else: value
  end
  
  def preload_associations(labour_control) do
    labour_control |> Novel.Repo.preload([
    	:labour])
  end
  
  def change_control_cost(labour_control) do
  	control = Novel.Repo.get(Novel.Control, labour_control.model.control_id)
  	control = Ecto.Changeset.change(control, total_cost: (control.total_cost - labour_control.model.total_cost))
  	Novel.Repo.update control
  	labour_control 
  end
end
