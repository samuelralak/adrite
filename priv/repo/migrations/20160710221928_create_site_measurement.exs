defmodule Novel.Repo.Migrations.CreateSiteMeasurement do
  use Ecto.Migration

  def change do
    create table(:site_measurements) do
      add :square_metres, :decimal
      add :price_per_square_metre, :float
      add :site_id, references(:sites, on_delete: :nothing)
      add :measurement_id, references(:measurements, on_delete: :nothing)

      timestamps
    end
    create index(:site_measurements, [:site_id])
    create index(:site_measurements, [:measurement_id])

  end
end
