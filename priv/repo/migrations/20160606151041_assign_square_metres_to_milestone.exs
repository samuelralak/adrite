defmodule Novel.Repo.Migrations.AssignSquareMetresToMilestone do
  use Ecto.Migration

  def change do
  	alter table(:site_milestones) do
    	add :square_meters, :decimal
  	end
  end
end
