import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Inspector } from "react-inspector";

import { DataSource, useConfiguratorState } from "@/configurator";
import { dataSourceToSparqlEditorUrl } from "@/domain/datasource";
import { useComponentsWithHierarchiesQuery } from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { useLocale } from "@/src";
import { useInteractiveFiltersRaw } from "@/stores/interactive-filters";
import useEvent from "@/utils/use-event";

const DebugInteractiveFilters = () => {
  const IFState = useInteractiveFiltersRaw();

  return (
    <>
      <Typography component="h3" variant="h4" sx={{ px: 5, color: "grey.700" }}>
        Interactive Filters State
      </Typography>
      <Box sx={{ p: 5 }}>
        <Inspector expandLevel={3} data={IFState} table={false} />
      </Box>
    </>
  );
};

const CubeMetadata = ({
  datasetIri,
  dataSource,
}: {
  datasetIri: string;
  dataSource: DataSource;
}) => {
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [{ data, fetching }] = useComponentsWithHierarchiesQuery({
    variables: {
      iri: datasetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
    pause: !expanded,
  });
  const handleChange: AccordionProps["onChange"] = useEvent((_ev, expanded) =>
    setExpanded(expanded)
  );

  return (
    <Stack direction="row" spacing={2}>
      <Accordion onChange={handleChange} expanded={expanded}>
        <AccordionSummary>
          <Icon name="column" display="inline" size={16} />{" "}
          <Typography variant="body2">Dimensions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {fetching ? <CircularProgress size={12} color="secondary" /> : null}

          {expanded && data?.dataCubeByIri ? (
            <Inspector
              data={Object.fromEntries([
                [
                  ...data.dataCubeByIri.dimensions,
                  ...data.dataCubeByIri.measures,
                ].map((d) => [d.label, d]),
              ])}
              table={false}
            />
          ) : null}
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};

const DebugConfigurator = () => {
  const [configuratorState] = useConfiguratorState();
  const sparqlEditorUrl = dataSourceToSparqlEditorUrl(
    configuratorState.dataSource
  );

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
              configuratorState.dataSource.url
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
        {
          <Button
            component="a"
            color="primary"
            variant="text"
            size="small"
            href={`${sparqlEditorUrl}#query=${encodeURIComponent(
              `#pragma describe.strategy cbd
              #pragma join.hash off
              
DESCRIBE <${configuratorState.dataSet ?? ""}>`
            )}&requestMethod=POST`}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<Icon name="linkExternal" size={16} />}
          >
            <Typography variant="body2">Cube Metadata Query</Typography>
          </Button>
        }
        {configuratorState.dataSet ? (
          <CubeMetadata
            datasetIri={configuratorState.dataSet}
            dataSource={configuratorState.dataSource}
          />
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
        <Inspector expandLevel={3} data={configuratorState} table={false} />
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
        backgroundColor: "background.main",
        borderTopStyle: "solid",
        borderColor: "divider",
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
