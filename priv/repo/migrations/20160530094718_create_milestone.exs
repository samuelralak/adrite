defmodule Novel.Repo.Migrations.CreateMilestone do
  use Ecto.Migration

  def change do
    create table(:milestones) do
      add :name, :string
      add :description, :string

      timestamps
    end

  end
end
