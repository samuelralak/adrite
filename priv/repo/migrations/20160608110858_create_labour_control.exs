defmodule Novel.Repo.Migrations.CreateLabourControl do
  use Ecto.Migration

  def change do
    create table(:labour_controls) do
      add :no_of_days, :integer
      add :total_cost, :float
      add :labour_id, references(:labours, on_delete: :nothing)

      timestamps
    end
    create index(:labour_controls, [:labour_id])

  end
end
