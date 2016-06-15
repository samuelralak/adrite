defmodule Novel.ControlControllerTest do
  use Novel.ConnCase

  alias Novel.Control
  @valid_attrs %{total_cost: "120.5"}
  @invalid_attrs %{}

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, control_path(conn, :index)
    assert html_response(conn, 200) =~ "Listing controls"
  end

  test "renders form for new resources", %{conn: conn} do
    conn = get conn, control_path(conn, :new)
    assert html_response(conn, 200) =~ "New control"
  end

  test "creates resource and redirects when data is valid", %{conn: conn} do
    conn = post conn, control_path(conn, :create), control: @valid_attrs
    assert redirected_to(conn) == control_path(conn, :index)
    assert Repo.get_by(Control, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, control_path(conn, :create), control: @invalid_attrs
    assert html_response(conn, 200) =~ "New control"
  end

  test "shows chosen resource", %{conn: conn} do
    control = Repo.insert! %Control{}
    conn = get conn, control_path(conn, :show, control)
    assert html_response(conn, 200) =~ "Show control"
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_error_sent 404, fn ->
      get conn, control_path(conn, :show, -1)
    end
  end

  test "renders form for editing chosen resource", %{conn: conn} do
    control = Repo.insert! %Control{}
    conn = get conn, control_path(conn, :edit, control)
    assert html_response(conn, 200) =~ "Edit control"
  end

  test "updates chosen resource and redirects when data is valid", %{conn: conn} do
    control = Repo.insert! %Control{}
    conn = put conn, control_path(conn, :update, control), control: @valid_attrs
    assert redirected_to(conn) == control_path(conn, :show, control)
    assert Repo.get_by(Control, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    control = Repo.insert! %Control{}
    conn = put conn, control_path(conn, :update, control), control: @invalid_attrs
    assert html_response(conn, 200) =~ "Edit control"
  end

  test "deletes chosen resource", %{conn: conn} do
    control = Repo.insert! %Control{}
    conn = delete conn, control_path(conn, :delete, control)
    assert redirected_to(conn) == control_path(conn, :index)
    refute Repo.get(Control, control.id)
  end
end
