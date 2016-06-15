defmodule Novel.Repo.Migrations.AddEstimatedBudgetToSite do
  use Ecto.Migration

  def change do
  	alter table(:sites) do
    	 add :estimated_budget, :float
  	end
  end
end
