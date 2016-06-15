defmodule Novel.Repo.Migrations.CreateSiteSubMilestone do
  use Ecto.Migration

  def change do
    create table(:site_sub_milestones) do
      add :start_date, :datetime
      add :end_date, :datetime
      add :notes, :text
      add :cost, :float
      add :is_completed, :boolean, default: false
      add :sub_milestone_id, references(:sub_milestones, on_delete: :nothing)
      add :site_id, references(:sites, on_delete: :nothing)
      add :site_milestone_id, references(:site_milestones, on_delete: :nothing)

      timestamps
    end
    create index(:site_sub_milestones, [:sub_milestone_id])
    create index(:site_sub_milestones, [:site_id])
    create index(:site_sub_milestones, [:site_milestone_id])

  end
end
