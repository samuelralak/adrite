defmodule Novel.MaterialControlsControllerTest do
  use Novel.ConnCase

  alias Novel.MaterialControls
  @valid_attrs %{amount: "120.5", total_cost: "120.5"}
  @invalid_attrs %{}

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, material_controls_path(conn, :index)
    assert html_response(conn, 200) =~ "Listing material controls"
  end

  test "renders form for new resources", %{conn: conn} do
    conn = get conn, material_controls_path(conn, :new)
    assert html_response(conn, 200) =~ "New material controls"
  end

  test "creates resource and redirects when data is valid", %{conn: conn} do
    conn = post conn, material_controls_path(conn, :create), material_controls: @valid_attrs
    assert redirected_to(conn) == material_controls_path(conn, :index)
    assert Repo.get_by(MaterialControls, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, material_controls_path(conn, :create), material_controls: @invalid_attrs
    assert html_response(conn, 200) =~ "New material controls"
  end

  test "shows chosen resource", %{conn: conn} do
    material_controls = Repo.insert! %MaterialControls{}
    conn = get conn, material_controls_path(conn, :show, material_controls)
    assert html_response(conn, 200) =~ "Show material controls"
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_error_sent 404, fn ->
      get conn, material_controls_path(conn, :show, -1)
    end
  end

  test "renders form for editing chosen resource", %{conn: conn} do
    material_controls = Repo.insert! %MaterialControls{}
    conn = get conn, material_controls_path(conn, :edit, material_controls)
    assert html_response(conn, 200) =~ "Edit material controls"
  end

  test "updates chosen resource and redirects when data is valid", %{conn: conn} do
    material_controls = Repo.insert! %MaterialControls{}
    conn = put conn, material_controls_path(conn, :update, material_controls), material_controls: @valid_attrs
    assert redirected_to(conn) == material_controls_path(conn, :show, material_controls)
    assert Repo.get_by(MaterialControls, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    material_controls = Repo.insert! %MaterialControls{}
    conn = put conn, material_controls_path(conn, :update, material_controls), material_controls: @invalid_attrs
    assert html_response(conn, 200) =~ "Edit material controls"
  end

  test "deletes chosen resource", %{conn: conn} do
    material_controls = Repo.insert! %MaterialControls{}
    conn = delete conn, material_controls_path(conn, :delete, material_controls)
    assert redirected_to(conn) == material_controls_path(conn, :index)
    refute Repo.get(MaterialControls, material_controls.id)
  end
end
