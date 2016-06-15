defmodule Novel.Repo.Migrations.AddSiteSubMilestoneIdToLabourControl do
  use Ecto.Migration

  def change do
  	alter table(:labour_controls) do
    	 add :site_sub_milestone_id, references(:site_sub_milestones, on_delete: :nothing)
  	end
  	create index(:labour_controls, [:site_sub_milestone_id])
  end
end
