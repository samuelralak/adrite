defmodule Novel.PageController do
  use Novel.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
