# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Novel.Repo.insert!(%Novel.SomeModel{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias Novel.Repo
alias Novel.User

admin_params = %{name: "admin", email: "admin@adrite.com", password: "12345678", password_confirmation: "12345678"}
admin = User.create_changeset(%User{}, admin_params) |> Repo.insert!
