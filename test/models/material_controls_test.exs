defmodule Novel.MaterialControlsTest do
  use Novel.ModelCase

  alias Novel.MaterialControls

  @valid_attrs %{amount: "120.5", total_cost: "120.5"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = MaterialControls.changeset(%MaterialControls{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = MaterialControls.changeset(%MaterialControls{}, @invalid_attrs)
    refute changeset.valid?
  end
end
