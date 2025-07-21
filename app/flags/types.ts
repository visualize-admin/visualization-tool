export type FlagValue = any;
type FlagType = "boolean" | "text";

const TYPE_PRIORITY: Record<FlagType, number> = {
  boolean: 0,
  text: 1,
};

export const FLAGS = [
  {
    name: "debug" as const,
    description:
      "Shows debug elements such as ConfiguratorState viewer and debug panel.",
    priority: 1,
    type: "boolean" as FlagType,
  },
  {
    name: "server-side-cache.disable" as const,
    description: "Disables server-side cache functionality.",
    type: "boolean" as FlagType,
  },
  {
    name: "easter-eggs" as const,
    description: "Enables hidden easter egg features.",
    type: "boolean" as FlagType,
  },
  {
    name: "wmts-show-extra-info" as const,
    description:
      "Displays additional debug information in WMTS provider autocomplete.",
    type: "boolean" as FlagType,
  },
  {
    name: "custom-scale-domain" as const,
    description: "Enables setting custom numerical scale domains.",
    type: "boolean" as FlagType,
  },
  {
    name: "convert-units" as const,
    description: "Enables unit conversion functionality.",
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
