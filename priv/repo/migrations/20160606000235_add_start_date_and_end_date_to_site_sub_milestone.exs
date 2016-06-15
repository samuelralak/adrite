defmodule Novel.Repo.Migrations.AddStartDateAndEndDateToSiteSubMilestone do
  use Ecto.Migration

  def change do
  	alter table(:site_sub_milestones) do
    	add :start_date, :string
    	add :end_date, :string
  	end
  end
end
