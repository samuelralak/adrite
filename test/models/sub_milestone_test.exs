defmodule Novel.SubMilestoneTest do
  use Novel.ModelCase

  alias Novel.SubMilestone

  @valid_attrs %{description: "some content", name: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = SubMilestone.changeset(%SubMilestone{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = SubMilestone.changeset(%SubMilestone{}, @invalid_attrs)
    refute changeset.valid?
  end
end
