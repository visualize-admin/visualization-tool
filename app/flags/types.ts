export type FlagValue = any;

export type FlagName =
  /** Whether debug UI like the configurator debug panel is shown */
  | "debug"
  /** Whether we can add dataset from shared dimensions */
  | "configurator.add-dataset.shared"
  /** Whether server side cache is disabled */
  | "server-side-cache.disable"
  /** The GraphQL endpoint, is used for testing purposes */
  | "graphql.endpoint"
  /** Use at your own risk */
  | "easter-eggs";
