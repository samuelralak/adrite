defmodule Novel.SiteMilestone do
	use Ecto.Model
  use Novel.Web, :model

  schema "site_milestones" do
    field :start_date, Ecto.DateTime
    field :end_date, Ecto.DateTime
    field :notes, :string
    field :total_cost, :float
    field :estimated_budget, :float
    field :is_completed, :boolean, default: false
    field :square_meters, :decimal
    field :progress, :float
    belongs_to :milestone, Novel.Milestone
    belongs_to :site, Novel.Site
    has_many :site_sub_milestones, Novel.SiteSubMilestone, on_delete: :delete_all

    timestamps
    
    # Virtual Fields
  	field :start_date_string, :string, virtual: true
  	field :end_date_string, :string, virtual: true
  end

  @required_fields ~w(site_id milestone_id square_meters)
  @optional_fields ~w(start_date_string end_date_string notes total_cost is_completed estimated_budget)

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
  	model
    |> cast(params, @required_fields, @optional_fields)
    |> parse_date("start_date")
    |> parse_date("end_date")
  end
  
  defp parse_date(changeset, field) do
  	if date = get_change(changeset, String.to_atom(field <> "_string")) do
  		date = String.split(date, "/")  
			|> List.to_tuple
			|> Ecto.Date.cast!
			|> Ecto.DateTime.from_date
			changeset
			|> put_change(String.to_atom(field), date)
		else
			changeset
  	end
  end
end
