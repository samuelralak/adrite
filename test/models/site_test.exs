defmodule Novel.SiteTest do
  use Novel.ModelCase

  alias Novel.Site

  @valid_attrs %{agreed_amount: "120.5", description: "some content", location: "some content", measurements: "some content", name: "some content", total_square_meters: 42}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Site.changeset(%Site{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Site.changeset(%Site{}, @invalid_attrs)
    refute changeset.valid?
  end
end
