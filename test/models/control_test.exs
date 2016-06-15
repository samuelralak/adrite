defmodule Novel.ControlTest do
  use Novel.ModelCase

  alias Novel.Control

  @valid_attrs %{total_cost: "120.5"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Control.changeset(%Control{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Control.changeset(%Control{}, @invalid_attrs)
    refute changeset.valid?
  end
end
