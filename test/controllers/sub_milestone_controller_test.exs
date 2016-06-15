defmodule Novel.SubMilestoneControllerTest do
  use Novel.ConnCase

  alias Novel.SubMilestone
  @valid_attrs %{description: "some content", name: "some content"}
  @invalid_attrs %{}

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, sub_milestone_path(conn, :index)
    assert html_response(conn, 200) =~ "Listing sub milestones"
  end

  test "renders form for new resources", %{conn: conn} do
    conn = get conn, sub_milestone_path(conn, :new)
    assert html_response(conn, 200) =~ "New sub milestone"
  end

  test "creates resource and redirects when data is valid", %{conn: conn} do
    conn = post conn, sub_milestone_path(conn, :create), sub_milestone: @valid_attrs
    assert redirected_to(conn) == sub_milestone_path(conn, :index)
    assert Repo.get_by(SubMilestone, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, sub_milestone_path(conn, :create), sub_milestone: @invalid_attrs
    assert html_response(conn, 200) =~ "New sub milestone"
  end

  test "shows chosen resource", %{conn: conn} do
    sub_milestone = Repo.insert! %SubMilestone{}
    conn = get conn, sub_milestone_path(conn, :show, sub_milestone)
    assert html_response(conn, 200) =~ "Show sub milestone"
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_error_sent 404, fn ->
      get conn, sub_milestone_path(conn, :show, -1)
    end
  end

  test "renders form for editing chosen resource", %{conn: conn} do
    sub_milestone = Repo.insert! %SubMilestone{}
    conn = get conn, sub_milestone_path(conn, :edit, sub_milestone)
    assert html_response(conn, 200) =~ "Edit sub milestone"
  end

  test "updates chosen resource and redirects when data is valid", %{conn: conn} do
    sub_milestone = Repo.insert! %SubMilestone{}
    conn = put conn, sub_milestone_path(conn, :update, sub_milestone), sub_milestone: @valid_attrs
    assert redirected_to(conn) == sub_milestone_path(conn, :show, sub_milestone)
    assert Repo.get_by(SubMilestone, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    sub_milestone = Repo.insert! %SubMilestone{}
    conn = put conn, sub_milestone_path(conn, :update, sub_milestone), sub_milestone: @invalid_attrs
    assert html_response(conn, 200) =~ "Edit sub milestone"
  end

  test "deletes chosen resource", %{conn: conn} do
    sub_milestone = Repo.insert! %SubMilestone{}
    conn = delete conn, sub_milestone_path(conn, :delete, sub_milestone)
    assert redirected_to(conn) == sub_milestone_path(conn, :index)
    refute Repo.get(SubMilestone, sub_milestone.id)
  end
end
