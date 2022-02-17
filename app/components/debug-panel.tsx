import React from "react";
import { Inspector } from "react-inspector";
import { Box, Link, Text } from "theme-ui";
import { useInteractiveFilters } from "../charts/shared/use-interactive-filters";
import { useConfiguratorState } from "../configurator";
import { SPARQL_EDITOR, SPARQL_ENDPOINT } from "../domain/env";
import { Icon } from "../icons";

const DebugInteractiveFilters = () => {
  const [interactiveFiltersState] = useInteractiveFilters();
  return (
    <>
      <Box as="h3" variant="text.lead" sx={{ px: 5, color: "monochrome700" }}>
        Interactive Filters State
      </Box>
      <Box sx={{ p: 5 }}>
        <Inspector expandLevel={3} data={interactiveFiltersState} />
      </Box>
    </>
  );
};

const DebugConfigurator = () => {
  const [configuratorState] = useConfiguratorState();
  return (
    <>
      <Box as="h3" variant="text.lead" sx={{ px: 5, color: "monochrome700" }}>
        Cube Tools
      </Box>
      <Box sx={{ p: 5 }}>
        {configuratorState.dataSet ? (
          <Link
            variant="primary"
            href={`https://cube-viewer.zazuko.com/?endpointUrl=${encodeURIComponent(
              SPARQL_ENDPOINT
            )}&user=&password=&sourceGraph=&cube=${encodeURIComponent(
              configuratorState.dataSet ?? ""
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Icon name="linkExternal" size={16} />
            <Text sx={{ ml: 2, fontSize: 3 }} variant="body">
              Open in Cube Viewer
            </Text>
          </Link>
        ) : (
          <Text variant="body">Please select a dataset first</Text>
        )}
        {SPARQL_EDITOR && (
          <Link
            variant="primary"
            href={`${SPARQL_EDITOR}#query=${encodeURIComponent(
              `#pragma describe.strategy cbd
DESCRIBE <${configuratorState.dataSet ?? ""}>`
            )}&requestMethod=POST`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: "flex", alignItems: "center", mt: 3 }}
          >
            <Icon name="linkExternal" size={16} />
            <Text sx={{ ml: 2, fontSize: 3 }} variant="body">
              Cube Metadata Query
            </Text>
          </Link>
        )}
      </Box>
      <Box as="h3" variant="text.lead" sx={{ px: 5, color: "monochrome700" }}>
        Configurator State{" "}
        <Link
          variant="inline"
          onClick={() => {
            console.log(configuratorState);
          }}
        >
          (dump to console)
        </Link>
      </Box>
      <Box sx={{ p: 5 }}>
        <Inspector expandLevel={3} data={configuratorState} />
      </Box>
    </>
  );
};

const DebugPanel = ({
  configurator = false,
  interactiveFilters = false,
}: {
  configurator?: Boolean;
  interactiveFilters?: Boolean;
}) => {
  return (
    <Box
      sx={{
        mt: 5,
        ml: -5,
        mr: -5,
        mb: -5,
        bg: "background",
        // boxShadow: "primary",
        borderTopStyle: "solid",
        borderColor: "monochrome500",
        borderWidth: 1,
      }}
    >
      <Box as="h3" variant="text.heading3" sx={{ p: 5, color: "warning" }}>
        🚧 Debug Panel 🚧
      </Box>
      {configurator ? <DebugConfigurator /> : null}
      {interactiveFilters ? <DebugInteractiveFilters /> : null}
    </Box>
  );
};

const DebugPanelNull = () => null;

const ExportedDebugPanel =
  process.env.NODE_ENV === "development" ? DebugPanel : DebugPanelNull;

export default ExportedDebugPanel;
