defmodule Novel.Repo.Migrations.AddMeasurementsToSite do
  use Ecto.Migration

  def change do
  	alter table(:sites) do
    	add :internal_walls_measurement, :decimal
    	add :ceilings_measurement, :decimal
    	add :woodwork_measurement, :decimal
    	add :metalwork_measurement, :decimal
    	add :externalworks_measurement, :decimal
  	end
  end
end
