defmodule Novel.Repo.Migrations.AddPositionToMilestone do
  use Ecto.Migration

  def change do
  	alter table(:milestones) do
    	 add :position, :integer
  	end
  end
end
