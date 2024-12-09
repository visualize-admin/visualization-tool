export type FlagValue = any;

export type FlagName =
  /** Whether debug UI like the configurator debug panel is shown */
  | "debug"
  /** Whether server side cache is disabled */
  | "server-side-cache.disable"
  /** The GraphQL endpoint, is used for testing purposes */
  | "graphql.endpoint"
  /** Use at your own risk */
  | "easter-eggs";
