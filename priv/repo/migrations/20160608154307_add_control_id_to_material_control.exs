defmodule Novel.Repo.Migrations.AddControlIdToMaterialControl do
  use Ecto.Migration

  def change do
  	alter table(:material_controls) do
    	 add :control_id, references(:controls, on_delete: :nothing)
  	end
  	create index(:material_controls, [:control_id])
  end
end
