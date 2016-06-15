defmodule Novel.LabourControlsTest do
  use Novel.ModelCase

  alias Novel.LabourControls

  @valid_attrs %{no_of_days: 42, total_cost: "120.5"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = LabourControls.changeset(%LabourControls{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = LabourControls.changeset(%LabourControls{}, @invalid_attrs)
    refute changeset.valid?
  end
end
