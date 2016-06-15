defmodule Novel.Repo.Migrations.AddProgressToSiteMilestone do
  use Ecto.Migration

  def change do
  	alter table(:site_milestones) do
    	 add :progress, :float, default: 0.0
  	end
  end
end
