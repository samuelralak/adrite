defmodule Novel.Repo.Migrations.RemoveStartDateAndDateFromSiteSubMilestone do
  use Ecto.Migration

  def change do
  	alter table(:site_sub_milestones) do
    	remove :start_date
    	remove :end_date
  	end
  end
end
