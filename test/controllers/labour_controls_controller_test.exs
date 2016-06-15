defmodule Novel.LabourControlsControllerTest do
  use Novel.ConnCase

  alias Novel.LabourControls
  @valid_attrs %{no_of_days: 42, total_cost: "120.5"}
  @invalid_attrs %{}

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, labour_controls_path(conn, :index)
    assert html_response(conn, 200) =~ "Listing labour controls"
  end

  test "renders form for new resources", %{conn: conn} do
    conn = get conn, labour_controls_path(conn, :new)
    assert html_response(conn, 200) =~ "New labour controls"
  end

  test "creates resource and redirects when data is valid", %{conn: conn} do
    conn = post conn, labour_controls_path(conn, :create), labour_controls: @valid_attrs
    assert redirected_to(conn) == labour_controls_path(conn, :index)
    assert Repo.get_by(LabourControls, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, labour_controls_path(conn, :create), labour_controls: @invalid_attrs
    assert html_response(conn, 200) =~ "New labour controls"
  end

  test "shows chosen resource", %{conn: conn} do
    labour_controls = Repo.insert! %LabourControls{}
    conn = get conn, labour_controls_path(conn, :show, labour_controls)
    assert html_response(conn, 200) =~ "Show labour controls"
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_error_sent 404, fn ->
      get conn, labour_controls_path(conn, :show, -1)
    end
  end

  test "renders form for editing chosen resource", %{conn: conn} do
    labour_controls = Repo.insert! %LabourControls{}
    conn = get conn, labour_controls_path(conn, :edit, labour_controls)
    assert html_response(conn, 200) =~ "Edit labour controls"
  end

  test "updates chosen resource and redirects when data is valid", %{conn: conn} do
    labour_controls = Repo.insert! %LabourControls{}
    conn = put conn, labour_controls_path(conn, :update, labour_controls), labour_controls: @valid_attrs
    assert redirected_to(conn) == labour_controls_path(conn, :show, labour_controls)
    assert Repo.get_by(LabourControls, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    labour_controls = Repo.insert! %LabourControls{}
    conn = put conn, labour_controls_path(conn, :update, labour_controls), labour_controls: @invalid_attrs
    assert html_response(conn, 200) =~ "Edit labour controls"
  end

  test "deletes chosen resource", %{conn: conn} do
    labour_controls = Repo.insert! %LabourControls{}
    conn = delete conn, labour_controls_path(conn, :delete, labour_controls)
    assert redirected_to(conn) == labour_controls_path(conn, :index)
    refute Repo.get(LabourControls, labour_controls.id)
  end
end
