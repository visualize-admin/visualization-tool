import React from "react";
import { Inspector } from "react-inspector";
import { Box, Button, Link, Typography } from "@mui/material";
import { useInteractiveFilters } from "../charts/shared/use-interactive-filters";
import { useConfiguratorState } from "../configurator";
import { SPARQL_EDITOR, SPARQL_ENDPOINT } from "../domain/env";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { Icon } from "../icons";
import { useLocale } from "../src";
import Stack from "./Stack";

const DebugInteractiveFilters = () => {
  const [interactiveFiltersState] = useInteractiveFilters();
  return (
    <>
      <Typography component="h3" variant="h4" sx={{ px: 5, color: "grey.700" }}>
        Interactive Filters State
      </Typography>
      <Box sx={{ p: 5 }}>
        <Inspector expandLevel={3} data={interactiveFiltersState} />
      </Box>
    </>
  );
};

const CubeMetadata = ({ datasetIri }: { datasetIri: string }) => {
  const locale = useLocale();
  const [{ data: metadata }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: {
      iri: datasetIri,
      locale: locale,
    },
  });
  return metadata ? (
    <Stack direction="row" spacing={2}>
      <Icon name="column" display="inline" size={16} />
      <Typography variant="body2">Dimensions</Typography>
      <Inspector
        data={Object.fromEntries(
          metadata?.dataCubeByIri?.dimensions.map((d) => [d.label, d]) || []
        )}
      />
    </Stack>
  ) : null;
};

const DebugConfigurator = () => {
  const [configuratorState] = useConfiguratorState();
  return (
    <>
      <Typography component="h3" variant="h4" sx={{ px: 5, color: "grey.700" }}>
        Cube Tools
      </Typography>
      <Stack spacing={2} sx={{ pl: 5, py: 3 }}>
        {configuratorState.dataSet ? (
          <Button
            component="a"
            color="primary"
            variant="text"
            size="small"
            href={`https://cube-viewer.zazuko.com/?endpointUrl=${encodeURIComponent(
              SPARQL_ENDPOINT
            )}&user=&password=&sourceGraph=&cube=${encodeURIComponent(
              configuratorState.dataSet ?? ""
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<Icon name="linkExternal" size={16} />}
          >
            <Typography variant="body2">Open in Cube Viewer</Typography>
          </Button>
        ) : (
          <Typography variant="body1">Please select a dataset first</Typography>
        )}
        {SPARQL_EDITOR && (
          <Button
            component="a"
            color="primary"
            variant="text"
            size="small"
            href={`${SPARQL_EDITOR}#query=${encodeURIComponent(
              `#pragma describe.strategy cbd
DESCRIBE <${configuratorState.dataSet ?? ""}>`
            )}&requestMethod=POST`}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<Icon name="linkExternal" size={16} />}
          >
            <Typography variant="body2">Cube Metadata Query</Typography>
          </Button>
        )}
        {configuratorState.dataSet ? (
          <CubeMetadata datasetIri={configuratorState.dataSet} />
        ) : null}
      </Stack>
      <Typography
        component="h3"
        variant="h4"
        sx={{ px: 5, display: "flex", alignItems: "center", color: "grey.700" }}
      >
        Configurator State{" "}
        <Button
          component="span"
          variant="text"
          size="small"
          onClick={() => {
            console.log(configuratorState);
          }}
        >
          (dump to console)
        </Button>
      </Typography>
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
        backgroundColor: "background",
        // boxShadow: "primary",
        borderTopStyle: "solid",
        borderColor: "grey.500",
        borderWidth: 1,
      }}
    >
      <Typography
        component="h3"
        variant="h3"
        sx={{ p: 5, color: "warning.main" }}
      >
        🚧 Debug Panel 🚧
      </Typography>
      {configurator ? <DebugConfigurator /> : null}
      {interactiveFilters ? <DebugInteractiveFilters /> : null}
    </Box>
  );
};

const DebugPanelNull = () => null;

const ExportedDebugPanel =
  process.env.NODE_ENV === "development" ? DebugPanel : DebugPanelNull;

export default ExportedDebugPanel;
