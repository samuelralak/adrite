defmodule Novel.Repo.Migrations.RemoveMeasurementsFromSite do
  use Ecto.Migration

  def change do
  	alter table(:sites) do
    	remove :measurements
  	end
  end
end
