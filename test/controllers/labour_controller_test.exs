defmodule Novel.LabourControllerTest do
  use Novel.ConnCase

  alias Novel.Labour
  @valid_attrs %{cost: "120.5", name: "some content"}
  @invalid_attrs %{}

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, labour_path(conn, :index)
    assert html_response(conn, 200) =~ "Listing labours"
  end

  test "renders form for new resources", %{conn: conn} do
    conn = get conn, labour_path(conn, :new)
    assert html_response(conn, 200) =~ "New labour"
  end

  test "creates resource and redirects when data is valid", %{conn: conn} do
    conn = post conn, labour_path(conn, :create), labour: @valid_attrs
    assert redirected_to(conn) == labour_path(conn, :index)
    assert Repo.get_by(Labour, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, labour_path(conn, :create), labour: @invalid_attrs
    assert html_response(conn, 200) =~ "New labour"
  end

  test "shows chosen resource", %{conn: conn} do
    labour = Repo.insert! %Labour{}
    conn = get conn, labour_path(conn, :show, labour)
    assert html_response(conn, 200) =~ "Show labour"
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_error_sent 404, fn ->
      get conn, labour_path(conn, :show, -1)
    end
  end

  test "renders form for editing chosen resource", %{conn: conn} do
    labour = Repo.insert! %Labour{}
    conn = get conn, labour_path(conn, :edit, labour)
    assert html_response(conn, 200) =~ "Edit labour"
  end

  test "updates chosen resource and redirects when data is valid", %{conn: conn} do
    labour = Repo.insert! %Labour{}
    conn = put conn, labour_path(conn, :update, labour), labour: @valid_attrs
    assert redirected_to(conn) == labour_path(conn, :show, labour)
    assert Repo.get_by(Labour, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    labour = Repo.insert! %Labour{}
    conn = put conn, labour_path(conn, :update, labour), labour: @invalid_attrs
    assert html_response(conn, 200) =~ "Edit labour"
  end

  test "deletes chosen resource", %{conn: conn} do
    labour = Repo.insert! %Labour{}
    conn = delete conn, labour_path(conn, :delete, labour)
    assert redirected_to(conn) == labour_path(conn, :index)
    refute Repo.get(Labour, labour.id)
  end
end
