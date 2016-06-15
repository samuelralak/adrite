defmodule Novel.SiteSubMilestoneControllerTest do
  use Novel.ConnCase

  alias Novel.SiteSubMilestone
  @valid_attrs %{cost: "120.5", end_date: "2010-04-17 14:00:00", is_completed: true, notes: "some content", start_date: "2010-04-17 14:00:00"}
  @invalid_attrs %{}

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, site_sub_milestone_path(conn, :index)
    assert html_response(conn, 200) =~ "Listing site sub milestones"
  end

  test "renders form for new resources", %{conn: conn} do
    conn = get conn, site_sub_milestone_path(conn, :new)
    assert html_response(conn, 200) =~ "New site sub milestone"
  end

  test "creates resource and redirects when data is valid", %{conn: conn} do
    conn = post conn, site_sub_milestone_path(conn, :create), site_sub_milestone: @valid_attrs
    assert redirected_to(conn) == site_sub_milestone_path(conn, :index)
    assert Repo.get_by(SiteSubMilestone, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, site_sub_milestone_path(conn, :create), site_sub_milestone: @invalid_attrs
    assert html_response(conn, 200) =~ "New site sub milestone"
  end

  test "shows chosen resource", %{conn: conn} do
    site_sub_milestone = Repo.insert! %SiteSubMilestone{}
    conn = get conn, site_sub_milestone_path(conn, :show, site_sub_milestone)
    assert html_response(conn, 200) =~ "Show site sub milestone"
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_error_sent 404, fn ->
      get conn, site_sub_milestone_path(conn, :show, -1)
    end
  end

  test "renders form for editing chosen resource", %{conn: conn} do
    site_sub_milestone = Repo.insert! %SiteSubMilestone{}
    conn = get conn, site_sub_milestone_path(conn, :edit, site_sub_milestone)
    assert html_response(conn, 200) =~ "Edit site sub milestone"
  end

  test "updates chosen resource and redirects when data is valid", %{conn: conn} do
    site_sub_milestone = Repo.insert! %SiteSubMilestone{}
    conn = put conn, site_sub_milestone_path(conn, :update, site_sub_milestone), site_sub_milestone: @valid_attrs
    assert redirected_to(conn) == site_sub_milestone_path(conn, :show, site_sub_milestone)
    assert Repo.get_by(SiteSubMilestone, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    site_sub_milestone = Repo.insert! %SiteSubMilestone{}
    conn = put conn, site_sub_milestone_path(conn, :update, site_sub_milestone), site_sub_milestone: @invalid_attrs
    assert html_response(conn, 200) =~ "Edit site sub milestone"
  end

  test "deletes chosen resource", %{conn: conn} do
    site_sub_milestone = Repo.insert! %SiteSubMilestone{}
    conn = delete conn, site_sub_milestone_path(conn, :delete, site_sub_milestone)
    assert redirected_to(conn) == site_sub_milestone_path(conn, :index)
    refute Repo.get(SiteSubMilestone, site_sub_milestone.id)
  end
end
