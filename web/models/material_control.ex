defmodule Novel.MaterialControl do
  use Novel.Web, :model
	use Ecto.Model
	
	after_load :preload_associations
	before_delete :change_control_cost
	
  schema "material_controls" do
    field :amount, :float
    field :total_cost, :float
    field :specified_rate, :float
    field :date, Ecto.Date
    belongs_to :material, Novel.Material
    belongs_to :control, Novel.Control
    belongs_to :site_sub_milestone, Novel.SiteSubMilestone

    timestamps

    field :date_string, :string, virtual: true
  end

  @required_fields ~w(date_string amount total_cost material_id amount)
  @optional_fields ~w(date control_id specified_rate)

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
    |> parse_date("date")
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

  defp parse_date(changeset, field) do
    if date = get_change(changeset, String.to_atom(field <> "_string")) do
      date = String.split(date, "/")  
      |> List.to_tuple
      |> Ecto.Date.cast!
      changeset
      |> put_change(String.to_atom(field), date)
    else
      changeset
    end
  end
  
  def preload_associations(material_control) do
    material_control |> Novel.Repo.preload([
    	:material])
  end
  
  def change_control_cost(material_control) do
  	control = Novel.Repo.get(Novel.Control, material_control.model.control_id)
  	control = Ecto.Changeset.change(control, total_cost: (control.total_cost - material_control.model.total_cost))
  	Novel.Repo.update control
  	material_control 
  end
end
