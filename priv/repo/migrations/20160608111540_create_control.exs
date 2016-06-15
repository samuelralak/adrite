defmodule Novel.Repo.Migrations.CreateControl do
  use Ecto.Migration

  def change do
    create table(:controls) do
      add :total_cost, :float
      add :site_sub_milestone_id, references(:site_sub_milestones, on_delete: :nothing)

      timestamps
    end
    create index(:controls, [:site_sub_milestone_id])

  end
end
