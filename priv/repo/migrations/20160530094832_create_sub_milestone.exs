defmodule Novel.Repo.Migrations.CreateSubMilestone do
  use Ecto.Migration

  def change do
    create table(:sub_milestones) do
      add :name, :string
      add :description, :text
      add :milestone_id, references(:milestones, on_delete: :nothing)

      timestamps
    end
    create index(:sub_milestones, [:milestone_id])

  end
end
