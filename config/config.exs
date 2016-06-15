# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# Configures the endpoint
config :novel, Novel.Endpoint,
  url: [host: "localhost"],
  root: Path.dirname(__DIR__),
  secret_key_base: "GjWB1/YYdw5CHB7FLwO2R+ob8VaBbzjY2Txgqk7VWGiVk0OOmY8paS3Ry357iPf+",
  render_errors: [accepts: ~w(html json)],
  pubsub: [name: Novel.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Guardian config
config :joken, config_module: Guardian.JWT

config :guardian, Guardian,
      issuer: "MyApp",
      ttl: { 30, :days },
      verify_issuer: true,
      secret_key: "lksdjowiurowieurlkjsdlwwer",
      serializer: PhoenixGuardian.GuardianSerializer
      
# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"

# Configure phoenix generators
config :phoenix, :generators,
  migration: true,
  binary_id: false
