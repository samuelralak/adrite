defmodule Novel.MilestoneControllerTest do
  use Novel.ConnCase

  alias Novel.Milestone
  @valid_attrs %{description: "some content", name: "some content"}
  @invalid_attrs %{}

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, milestone_path(conn, :index)
    assert html_response(conn, 200) =~ "Listing milestones"
  end

  test "renders form for new resources", %{conn: conn} do
    conn = get conn, milestone_path(conn, :new)
    assert html_response(conn, 200) =~ "New milestone"
  end

  test "creates resource and redirects when data is valid", %{conn: conn} do
    conn = post conn, milestone_path(conn, :create), milestone: @valid_attrs
    assert redirected_to(conn) == milestone_path(conn, :index)
    assert Repo.get_by(Milestone, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, milestone_path(conn, :create), milestone: @invalid_attrs
    assert html_response(conn, 200) =~ "New milestone"
  end

  test "shows chosen resource", %{conn: conn} do
    milestone = Repo.insert! %Milestone{}
    conn = get conn, milestone_path(conn, :show, milestone)
    assert html_response(conn, 200) =~ "Show milestone"
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_error_sent 404, fn ->
      get conn, milestone_path(conn, :show, -1)
    end
  end

  test "renders form for editing chosen resource", %{conn: conn} do
    milestone = Repo.insert! %Milestone{}
    conn = get conn, milestone_path(conn, :edit, milestone)
    assert html_response(conn, 200) =~ "Edit milestone"
  end

  test "updates chosen resource and redirects when data is valid", %{conn: conn} do
    milestone = Repo.insert! %Milestone{}
    conn = put conn, milestone_path(conn, :update, milestone), milestone: @valid_attrs
    assert redirected_to(conn) == milestone_path(conn, :show, milestone)
    assert Repo.get_by(Milestone, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    milestone = Repo.insert! %Milestone{}
    conn = put conn, milestone_path(conn, :update, milestone), milestone: @invalid_attrs
    assert html_response(conn, 200) =~ "Edit milestone"
  end

  test "deletes chosen resource", %{conn: conn} do
    milestone = Repo.insert! %Milestone{}
    conn = delete conn, milestone_path(conn, :delete, milestone)
    assert redirected_to(conn) == milestone_path(conn, :index)
    refute Repo.get(Milestone, milestone.id)
  end
end
