import React from "react";
import { Inspector } from "react-inspector";
import { Box } from "theme-ui";
import { useInteractiveFilters } from "../charts/shared/use-interactive-filters";
import { useConfiguratorState } from "../configurator";

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
        Configurator State
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
