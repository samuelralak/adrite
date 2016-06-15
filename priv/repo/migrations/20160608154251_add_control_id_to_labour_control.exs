defmodule Novel.Repo.Migrations.AddControlIdToLabourControl do
  use Ecto.Migration

  def change do
  	alter table(:labour_controls) do
    	 add :control_id, references(:controls, on_delete: :nothing)
  	end
  	create index(:labour_controls, [:control_id])
  end
end
