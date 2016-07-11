defmodule Novel.Repo.Migrations.CreateMeasurement do
  use Ecto.Migration

  def change do
    create table(:measurements) do
      add :name, :string
      add :code, :string
      add :is_active, :boolean, default: false

      timestamps
    end

  end
end
