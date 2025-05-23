export type FlagValue = any;
export type FlagType = "boolean" | "text";

const TYPE_PRIORITY: Record<FlagType, number> = {
  boolean: 0,
  text: 1,
};

export const FLAGS = [
  {
    name: "debug" as const,
    description:
      "Controls whether debug elements are shown, e.g. ConfiguratorState viewer or this debug panel.",
    priority: 1,
    type: "boolean" as FlagType,
  },
  {
    name: "server-side-cache.disable" as const,
    description: "Disables server side cache.",
    type: "boolean" as FlagType,
  },
  {
    name: "graphql.endpoint" as const,
    description: "GraphQL endpoint, can be used for testing.",
    type: "text" as FlagType,
  },
  {
    name: "easter-eggs" as const,
    description: "Enables easter eggs.",
    type: "boolean" as FlagType,
  },
  {
    name: "enable-experimental-features" as const,
    description:
      "Enables experimental features, including dashboard text blocks, Markdown editor and bar charts.",
    type: "boolean" as FlagType,
  },
  {
    name: "wmts-show-extra-info" as const,
    description: "Show extra debug info in WMTS provider autocomplete.",
    type: "boolean" as FlagType,
  },
  {
    name: "custom-scale-domain" as const,
    description: "Allows users to set custom numerical scale domains.",
    type: "boolean" as FlagType,
  },
  {
    name: "convert-units" as const,
    description: "Enables unit conversion.",
    type: "boolean" as FlagType,
  },
].sort(
  (a, b) =>
    (b.priority ?? 0) - (a.priority ?? 0) ||
    TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type] ||
    a.name.localeCompare(b.name)
);
export const FLAG_NAMES = FLAGS.map((flag) => flag.name);
type Flag = (typeof FLAGS)[number];
export type FlagName = Flag["name"];
