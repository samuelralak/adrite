defmodule Novel.Router do
  use Novel.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
 	end
 	
 	pipeline :browser_session do
    plug Guardian.Plug.VerifySession # looks in the session for the token
  	plug Guardian.Plug.LoadResource
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Novel do
    pipe_through [:browser, :browser_session] # Use the default browser stack

    get "/", SiteController, :index
    get "/login", SessionController, :new
    get "/user/edit", UserController, :edit
    get "/close/:id", SiteSubMilestoneController, :close
    get "/site/:site_id/controls", SiteController, :controls
    
    put "/user", UserController, :update
    post "/sites/new", SiteController, :new
    post "/login", SessionController, :create
    delete "/logout", SessionController, :delete
    
    resources "/sites", SiteController, except: [:index] do
      resources "/controls", ControlController, only: [:index]
    end
    
    resources "/milestones", MilestoneController
    resources "/sub_milestones", SubMilestoneController
    resources "/site_milestones", SiteMilestoneController
    resources "/site_sub_milestones", SiteSubMilestoneController do
		  resources "/material_controls", MaterialControlController
		  resources "/labour_controls", LabourControlController
		  resources "/controls", ControlController
    end
    resources "/materials", MaterialController
    resources "/labours", LabourController
    resources "/reports", ReportsController, only: [:show]
  end

  # Other scopes may use custom stacks.
  # scope "/api", Novel do
  #   pipe_through :api
  # end
end
