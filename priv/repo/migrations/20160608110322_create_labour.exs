defmodule Novel.Repo.Migrations.CreateLabour do
  use Ecto.Migration

  def change do
    create table(:labours) do
      add :name, :string
      add :cost, :float

      timestamps
    end

  end
end
