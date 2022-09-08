import produce from "immer";

export const CHART_CONFIG_VERSION = "1.0.2";

type Migration = {
  description: string;
  from: string;
  to: string;
  up: (config: any) => any;
  down: (config: any) => any;
};

const migrations: Migration[] = [
  {
    description: `MAP
    baseLayer {
      + locked
      + bbox
    }`,
    from: "1.0.0",
    to: "1.0.1",
    up: (config: any) => {
      let newConfig = { ...config, version: "1.0.1" };

      if (newConfig.chartType === "map") {
        const { baseLayer } = newConfig;
        newConfig = produce(newConfig, (draft: any) => {
          draft.baseLayer = {
            show: baseLayer.show,
            locked: false,
          };
        });
      }

      return newConfig;
    },
    down: (config: any) => {
      let newConfig = { ...config, version: "1.0.0" };

      if (newConfig.chartType === "map") {
        const { baseLayer } = newConfig;
        newConfig = produce(newConfig, (draft: any) => {
          draft.baseLayer = {
            show: baseLayer.show,
          };
        });
      }

      return newConfig;
    },
  },
  {
    description: `MAP
    symbolLayer {
      + colors {
        + type
        + value
        + opacity
      }
      - color
    }`,
    from: "1.0.1",
    to: "1.0.2",
    up: (config: any) => {
      let newConfig = { ...config, version: "1.0.2" };

      if (newConfig.chartType === "map") {
        const { fields } = newConfig;
        const { symbolLayer } = fields;
        const { show, componentIri, measureIri, color } = symbolLayer;
        newConfig = produce(newConfig, (draft: any) => {
          draft.fields.symbolLayer = {
            show,
            componentIri,
            measureIri,
            colors: {
              type: "fixed",
              value: color,
              opacity: 80,
            },
          };
        });
      }

      return newConfig;
    },
    down: (config: any) => {
      let newConfig = { ...config, version: "1.0.1" };

      if (newConfig.chartType === "map") {
        const { fields } = newConfig;
        const { symbolLayer } = fields;
        const { show, componentIri, measureIri, colors } = symbolLayer;
        newConfig = produce(newConfig, (draft: any) => {
          draft.fields.symbolLayer = {
            show,
            componentIri,
            measureIri,
            color: colors.value,
          };
        });
      }

      return newConfig;
    },
  },
];

export const migrateChartConfig = (
  config: any,
  {
    fromVersion,
    toVersion = CHART_CONFIG_VERSION,
  }: { fromVersion?: string; toVersion?: string } = {}
): any => {
  const fromVersionFinal = fromVersion || config.version || "1.0.0";
  const direction = upOrDown(fromVersionFinal, toVersion);

  if (direction === "same") {
    return config;
  }

  const currentMigration = migrations.find(
    (migration) =>
      migration[direction === "up" ? "from" : "to"] === fromVersionFinal
  );

  if (currentMigration) {
    const newConfig = currentMigration[direction](config);
    return migrateChartConfig(newConfig, { fromVersion, toVersion });
  }

  return config;
};

const upOrDown = (
  fromVersion: string,
  toVersion: string
): "up" | "down" | "same" => {
  const fromNumbers = fromVersion.split(".").map((d) => +d);
  const toNumbers = toVersion.split(".").map((d) => +d);

  for (let i = 0; i < fromNumbers.length; i++) {
    if (fromNumbers[i] < toNumbers[i]) {
      return "up";
    }

    if (fromNumbers[i] > toNumbers[i]) {
      return "down";
    }
  }

  return "same";
};
