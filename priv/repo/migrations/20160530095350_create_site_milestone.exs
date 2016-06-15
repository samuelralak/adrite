defmodule Novel.Repo.Migrations.CreateSiteMilestone do
  use Ecto.Migration

  def change do
    create table(:site_milestones) do
      add :start_date, :datetime
      add :end_date, :datetime
      add :notes, :text
      add :total_cost, :float
      add :is_completed, :boolean, default: false
      add :milestone_id, references(:milestones, on_delete: :nothing)
      add :site_id, references(:sites, on_delete: :nothing)

      timestamps
    end
    create index(:site_milestones, [:milestone_id])
    create index(:site_milestones, [:site_id])

  end
end
