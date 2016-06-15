ExUnit.start

Mix.Task.run "ecto.create", ~w(-r Novel.Repo --quiet)
Mix.Task.run "ecto.migrate", ~w(-r Novel.Repo --quiet)
Ecto.Adapters.SQL.begin_test_transaction(Novel.Repo)

