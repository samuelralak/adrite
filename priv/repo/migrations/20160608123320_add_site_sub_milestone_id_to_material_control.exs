defmodule Novel.Repo.Migrations.AddSiteSubMilestoneIdToMaterialControl do
  use Ecto.Migration

  def change do
  	alter table(:material_controls) do
    	 add :site_sub_milestone_id, references(:site_sub_milestones, on_delete: :nothing)
  	end
  	create index(:material_controls, [:site_sub_milestone_id])
  end
end
