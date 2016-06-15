defmodule Novel.Repo.Migrations.AddEstimatedBudgetToSiteSubMilestone do
  use Ecto.Migration

  def change do
  	alter table(:site_sub_milestones) do
    	 add :estimated_budget, :float
  	end
  end
end
