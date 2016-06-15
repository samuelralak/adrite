defmodule Novel.Repo.Migrations.CreateMaterial do
  use Ecto.Migration

  def change do
    create table(:materials) do
      add :name, :string
      add :cost, :float

      timestamps
    end

  end
end
