defmodule Novel.MaterialControllerTest do
  use Novel.ConnCase

  alias Novel.Material
  @valid_attrs %{cost: "120.5", name: "some content"}
  @invalid_attrs %{}

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, material_path(conn, :index)
    assert html_response(conn, 200) =~ "Listing materials"
  end

  test "renders form for new resources", %{conn: conn} do
    conn = get conn, material_path(conn, :new)
    assert html_response(conn, 200) =~ "New material"
  end

  test "creates resource and redirects when data is valid", %{conn: conn} do
    conn = post conn, material_path(conn, :create), material: @valid_attrs
    assert redirected_to(conn) == material_path(conn, :index)
    assert Repo.get_by(Material, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, material_path(conn, :create), material: @invalid_attrs
    assert html_response(conn, 200) =~ "New material"
  end

  test "shows chosen resource", %{conn: conn} do
    material = Repo.insert! %Material{}
    conn = get conn, material_path(conn, :show, material)
    assert html_response(conn, 200) =~ "Show material"
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_error_sent 404, fn ->
      get conn, material_path(conn, :show, -1)
    end
  end

  test "renders form for editing chosen resource", %{conn: conn} do
    material = Repo.insert! %Material{}
    conn = get conn, material_path(conn, :edit, material)
    assert html_response(conn, 200) =~ "Edit material"
  end

  test "updates chosen resource and redirects when data is valid", %{conn: conn} do
    material = Repo.insert! %Material{}
    conn = put conn, material_path(conn, :update, material), material: @valid_attrs
    assert redirected_to(conn) == material_path(conn, :show, material)
    assert Repo.get_by(Material, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    material = Repo.insert! %Material{}
    conn = put conn, material_path(conn, :update, material), material: @invalid_attrs
    assert html_response(conn, 200) =~ "Edit material"
  end

  test "deletes chosen resource", %{conn: conn} do
    material = Repo.insert! %Material{}
    conn = delete conn, material_path(conn, :delete, material)
    assert redirected_to(conn) == material_path(conn, :index)
    refute Repo.get(Material, material.id)
  end
end
