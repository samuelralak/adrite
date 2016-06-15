defmodule Novel.Repo.Migrations.CreateMaterialControl do
  use Ecto.Migration

  def change do
    create table(:material_controls) do
      add :amount, :float
      add :total_cost, :float
      add :material_id, references(:materials, on_delete: :nothing)

      timestamps
    end
    create index(:material_controls, [:material_id])

  end
end
