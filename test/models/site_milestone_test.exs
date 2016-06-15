defmodule Novel.SiteMilestoneTest do
  use Novel.ModelCase

  alias Novel.SiteMilestone

  @valid_attrs %{end_date: "2010-04-17 14:00:00", is_completed: true, notes: "some content", start_date: "2010-04-17 14:00:00", total_cost: "120.5"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = SiteMilestone.changeset(%SiteMilestone{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = SiteMilestone.changeset(%SiteMilestone{}, @invalid_attrs)
    refute changeset.valid?
  end
end
