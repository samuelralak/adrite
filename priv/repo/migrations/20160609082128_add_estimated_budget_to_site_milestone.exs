defmodule Novel.Repo.Migrations.AddEstimatedBudgetToSiteMilestone do
  use Ecto.Migration

  def change do
  	alter table(:site_milestones) do
    	 add :estimated_budget, :float
  	end
  end
end
