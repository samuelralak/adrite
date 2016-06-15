defmodule Novel.MaterialTest do
  use Novel.ModelCase

  alias Novel.Material

  @valid_attrs %{cost: "120.5", name: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Material.changeset(%Material{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Material.changeset(%Material{}, @invalid_attrs)
    refute changeset.valid?
  end
end
