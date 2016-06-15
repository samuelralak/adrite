defmodule Novel.Repo.Migrations.CreateSite do
  use Ecto.Migration

  def change do
    create table(:sites) do
      add :name, :string
      add :location, :string
      add :measurements, :string
      add :total_square_meters, :integer
      add :agreed_amount, :float
      add :description, :text

      timestamps
    end

  end
end
