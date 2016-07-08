defmodule Novel.Repo.Migrations.AddColumnsToMaterialControl do
  use Ecto.Migration

  def change do
  	alter table(:material_controls) do
    	 add :date, :date
    	 add :specified_rate, :float
  	end
  end
end
