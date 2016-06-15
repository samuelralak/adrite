defmodule Novel.SiteSubMilestoneTest do
  use Novel.ModelCase

  alias Novel.SiteSubMilestone

  @valid_attrs %{cost: "120.5", end_date: "2010-04-17 14:00:00", is_completed: true, notes: "some content", start_date: "2010-04-17 14:00:00"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = SiteSubMilestone.changeset(%SiteSubMilestone{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = SiteSubMilestone.changeset(%SiteSubMilestone{}, @invalid_attrs)
    refute changeset.valid?
  end
end
