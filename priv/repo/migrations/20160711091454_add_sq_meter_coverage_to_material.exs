defmodule Novel.Repo.Migrations.AddSqMeterCoverageToMaterial do
  use Ecto.Migration

  def change do
  	alter table(:materials) do
    	add :sq_meter_coverage, :float, default: 10.0
  	end
  end
end
