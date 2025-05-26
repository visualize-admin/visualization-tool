import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  paperClasses,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useState } from "react";
import { Inspector } from "react-inspector";

import { getChartConfig } from "@/config-utils";
import { ChartConfig, DataSource, useConfiguratorState } from "@/configurator";
import { dataSourceToSparqlEditorUrl } from "@/domain/datasource";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { Icon } from "@/icons";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import { useLocale } from "@/src";
import { useInteractiveFiltersGetState } from "@/stores/interactive-filters";
import useEvent from "@/utils/use-event";
import { DISABLE_SCREENSHOT_ATTR } from "@/utils/use-screenshot";

const DebugInteractiveFilters = () => {
  const getInteractiveFiltersState = useInteractiveFiltersGetState();

  return (
    <>
      <Typography component="h3" variant="h4" sx={{ px: 5, color: "grey.700" }}>
        Interactive Filters State
      </Typography>
      <Box sx={{ p: 5 }}>
        <Inspector
          expandLevel={3}
          data={getInteractiveFiltersState()}
          table={false}
        />
      </Box>
    </>
  );
};

const CubeMetadata = ({
  datasetIri,
  dataSource,
  chartConfig,
}: {
  datasetIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
}) => {
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [{ data, fetching }] = useDataCubesComponentsQuery({
    chartConfig,
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: [{ iri: datasetIri }],
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

          {expanded && data?.dataCubesComponents ? (
            <Inspector
              data={Object.fromEntries([
                [
                  ...data.dataCubesComponents.dimensions,
                  ...data.dataCubesComponents.measures,
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
  const chartConfig = getChartConfig(configuratorState);
  const sparqlEditorUrl = dataSourceToSparqlEditorUrl(
    configuratorState.dataSource
  );

  return (
    <>
      <Typography component="h3" variant="h4" sx={{ px: 5, color: "grey.700" }}>
        Cube Tools
      </Typography>
      {chartConfig.cubes.map((cube) => (
        <Stack key={cube.iri} spacing={2} sx={{ pl: 5, py: 3 }}>
          <Button
            component="a"
            color="primary"
            variant="text"
            size="sm"
            href={`https://cube-viewer.zazuko.com/?endpointUrl=${encodeURIComponent(
              configuratorState.dataSource.url
            )}&user=&password=&sourceGraph=&cube=${encodeURIComponent(
              cube.iri
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<Icon name="legacyLinkExternal" size={16} />}
          >
            <Typography variant="body2">Open in Cube Viewer</Typography>
          </Button>
          <Button
            component="a"
            color="primary"
            variant="text"
            size="sm"
            href={`${sparqlEditorUrl}#query=${encodeURIComponent(
              `#pragma describe.strategy cbd

               DESCRIBE <${cube.iri}>`
            )}&requestMethod=POST`}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<Icon name="legacyLinkExternal" size={16} />}
          >
            <Typography variant="body2">Cube Metadata Query</Typography>
          </Button>
          <CubeMetadata
            datasetIri={cube.iri}
            dataSource={configuratorState.dataSource}
            chartConfig={chartConfig}
          />
        </Stack>
      ))}
      <Typography
        component="h3"
        variant="h4"
        sx={{ px: 5, display: "flex", alignItems: "center", color: "grey.700" }}
      >
        Configurator State{" "}
        <Button
          component="span"
          variant="text"
          size="sm"
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

export type DebugPanelProps = {
  configurator?: Boolean;
  interactiveFilters?: Boolean;
};

const useStyles = makeStyles((theme: Theme) => ({
  debugPanel: {
    margin: -theme.spacing(5),
    marginTop: theme.spacing(5),
    backgroundColor: theme.palette.background.default,
    borderTopStyle: "solid",
    borderColor: theme.palette.divider,
    borderWidth: 1,

    [`&.${paperClasses.root}`]: {
      boxShadow: "none",
    },
  },
  debugTitle: {
    color: theme.palette.warning.main,
  },
}));

const DebugPanel = (props: DebugPanelProps) => {
  const { configurator = false, interactiveFilters = false } = props;
  const classes = useStyles();

  return (
    <Accordion
      disableGutters
      className={classes.debugPanel}
      square
      {...DISABLE_SCREENSHOT_ATTR}
    >
      <AccordionSummary
        expandIcon={
          <Box p={2}>
            <SvgIcChevronRight width="2em" height="2em" fontSize={"0.5em"} />
          </Box>
        }
      >
        <Typography component="h3" variant="h5" className={classes.debugTitle}>
          🚧 Debug Panel 🚧
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {configurator ? <DebugConfigurator /> : null}
        {interactiveFilters ? <DebugInteractiveFilters /> : null}
      </AccordionDetails>
    </Accordion>
  );
};

export default DebugPanel;
