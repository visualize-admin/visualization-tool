export type FlagValue = any;
export const FLAGS = [
  {
    name: "debug" as const,
    description:
      "Controls whether debug elements are shown, e.g. ConfiguratorState viewer or this debug panel.",
  },
  {
    name: "server-side-cache.disable" as const,
    description: "Disables server side cache.",
  },
  {
    name: "graphql.endpoint" as const,
    description: "GraphQL endpoint, can be used for testing.",
  },
  {
    name: "easter-eggs" as const,
    description: "Enables easter eggs",
  },
  {
    name: "enable-experimental-features" as const,
    description:
      "Enables experimental features, including dashboard text blocks, Markdown editor and bar charts.",
  },
  {
    name: "wmts-show-extra-info" as const,
    description: "Show extra debug info in WMTS provider autocomplete",
  },
  {
    name: "custom-scale-domain" as const,
    description: "Allows users to set custom numerical scale domains.",
  },
  {
    name: "convert-units" as const,
    description: "Enables unit conversion.",
  },
];
export const FLAG_NAMES = FLAGS.map((flag) => flag.name);
type Flag = (typeof FLAGS)[number];
export type FlagName = Flag["name"];
