defmodule Novel.SiteMeasurementTest do
  use Novel.ModelCase

  alias Novel.SiteMeasurement

  @valid_attrs %{price_per_square_metre: "120.5", square_metres: "120.5"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = SiteMeasurement.changeset(%SiteMeasurement{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = SiteMeasurement.changeset(%SiteMeasurement{}, @invalid_attrs)
    refute changeset.valid?
  end
end
