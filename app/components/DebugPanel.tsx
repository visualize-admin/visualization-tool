import React from "react";
import { Inspector } from "react-inspector";
import { Box } from "theme-ui";
import { useInteractiveFilters } from "../charts/shared/use-interactive-filters";
import { useConfiguratorState } from "../configurator";

const DebugInteractiveFilters = () => {
  const [interactiveFiltersState] = useInteractiveFilters();
  return (
    <>
      interactive filters: <Inspector data={interactiveFiltersState} />
    </>
  );
};

const DebugConfigurator = () => {
  const [configuratorState] = useConfiguratorState();
  return (
    <>
      configurator: <Inspector data={configuratorState} />
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
    <Box my={3} p={2} bg="muted">
      {configurator ? <DebugConfigurator /> : null}
      {interactiveFilters ? <DebugInteractiveFilters /> : null}
    </Box>
  );
};

const DebugPanelNull = () => null;

const ExportedDebugPanel =
  process.env.NODE_ENV === "development" ? DebugPanel : DebugPanelNull;

export default ExportedDebugPanel;
