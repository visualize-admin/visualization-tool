import { writeFileSync } from "fs";

import { toJsonSchema } from "io-ts-to-json-schema";

const { ChartConfig, ConfiguratorState } = require("../config-types");

const generateAndWriteJsonSchema = ({
  $id,
  type,
  title,
  description,
}: {
  $id: string;
  type: any;
  title: string;
  description: string;
}) => {
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id,
    type: "object",
    title,
    description,
    properties: {
      // Add the $schema property to the schema to enable IDE suggestions.
      // Do not make it required, as it is not a part of the JSON schema spec.
      $schema: {
        type: "string",
        const: $id,
      },
      schema: toJsonSchema(type),
    },
  };
  writeFileSync(
    `./app/public/json-schema/${$id.split("/").pop()}`,
    JSON.stringify(schema, null, 2)
  );
};

generateAndWriteJsonSchema({
  $id: "https://visualize.admin.ch/json-schema/chart-config.json",
  type: ChartConfig,
  title: "Chart Config",
  description: "JSON Schema for visualize.admin chart configuration.",
});

generateAndWriteJsonSchema({
  $id: "https://visualize.admin.ch/json-schema/configurator-state.json",
  type: ConfiguratorState,
  title: "Configurator State",
  description: "JSON Schema for visualize.admin configurator state.",
});
