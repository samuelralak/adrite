defmodule Novel.Repo.Migrations.AddColumnsToLabourControl do
  use Ecto.Migration

  def change do
  	alter table(:labour_controls) do
    	 add :date, :date
    	 add :specified_rate, :float
    	 add :no_of_workers, :integer
  	end
  end
end
