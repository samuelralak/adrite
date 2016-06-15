defmodule Novel.MilestoneTest do
  use Novel.ModelCase

  alias Novel.Milestone

  @valid_attrs %{description: "some content", name: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Milestone.changeset(%Milestone{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Milestone.changeset(%Milestone{}, @invalid_attrs)
    refute changeset.valid?
  end
end
