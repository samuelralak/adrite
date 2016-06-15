defmodule Novel.Repo.Migrations.AddPositionToSubMilestone do
  use Ecto.Migration

  def change do
  	alter table(:sub_milestones) do
    	 add :position, :integer
  	end
  end
end
