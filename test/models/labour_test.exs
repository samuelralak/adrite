defmodule Novel.LabourTest do
  use Novel.ModelCase

  alias Novel.Labour

  @valid_attrs %{cost: "120.5", name: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Labour.changeset(%Labour{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Labour.changeset(%Labour{}, @invalid_attrs)
    refute changeset.valid?
  end
end
