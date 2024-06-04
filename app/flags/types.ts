export type FlagValue = any;

export type FlagName =
  /** Whether we can search by termsets */
  | "search.termsets"
  /** Whether we can add dataset from shared dimensions */
  | "configurator.add-dataset.shared"
  /** Whether we can add a new dataset */
  | "configurator.add-dataset.new"
  /** Whether we can use the free canvas dashboard layout */
  | "layouter.dashboard.free-canvas"
  /** Whether we can use shared filters on dashboard layout */
  | "layouter.dashboard.shared-filters";
