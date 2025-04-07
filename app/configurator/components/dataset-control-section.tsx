import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  IconButton,
  Theme,
  tooltipClasses,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import uniqBy from "lodash/uniqBy";
import { useMemo, useState } from "react";
import { useClient } from "urql";

import Flex from "@/components/flex";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { useMetadataPanelStoreActions } from "@/components/metadata-panel-store";
import useDisclosure from "@/components/use-disclosure";
import { getChartConfig } from "@/config-utils";
import { DatasetDialog as AddDatasetDrawer } from "@/configurator/components/add-dataset-drawer";
import { DatasetsBadge } from "@/configurator/components/badges";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { DataCubeMetadata } from "@/domain/data";
import {
  executeDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
} from "@/graphql/hooks";
import { Icon } from "@/icons";
import SvgIcTrash from "@/icons/components/IcTrash";
import { useLocale } from "@/locales/use-locale";
import { useEventEmitter } from "@/utils/eventEmitter";

const useStyles = makeStyles((theme: Theme) => ({
  row: {
    borderLeft: "0.25rem solid transparent",
    paddingLeft: "0.25rem",
    marginLeft: "-0.5rem",
    transition: "border-left-color 1s ease",
    display: "flex",
    justifyContent: "space-between",
  },
  added: {
    transition: "border-left-color 0.25s ease",
    borderLeftColor: theme.palette.success.main,
  },
  tooltipPopper: {
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: "none",
      padding: "0.75rem",
      backgroundColor: theme.palette.success.light,
      color: theme.palette.success.main,
      lineHeight: 1.5,
      whiteSpace: "nowrap",
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.success.light,
    },
  },
}));

const DatasetRow = ({
  canRemove,
  handleDatasetClick,
  cube,
  added,
  onRemoveAdded,
}: {
  canRemove: boolean;
  handleDatasetClick: () => void;
  cube: DataCubeMetadata;
  /** When the dataset has been added just not */
  added?: boolean;
  onRemoveAdded?: () => void;
}) => {
  const locale = useLocale();
  const client = useClient();
  const classes = useStyles();
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const [loading, setLoading] = useState(false);

  return (
    <MaybeTooltip
      title={
        <Box alignItems="center" display="flex" gap="0.75rem">
          <Box color="success.main">
            <Icon name="checkmarkCircle" />
          </Box>
          {t({
            id: "dataset.search.preview.added-dataset",
            message:
              "New dataset added. You can now use its data in the chart(s).",
          })}
        </Box>
      }
      tooltipProps={{
        open: added,
        placement: "right",
        PopperProps: {
          onClick: () => onRemoveAdded?.(),
          className: classes.tooltipPopper,
        },
      }}
    >
      <div
        key={cube.iri}
        className={clsx(classes.row, { [classes.added]: added })}
      >
        <Flex
          sx={{ flexDirection: "column", alignItems: "flex-start", gap: 1 }}
        >
          <Button
            variant="text"
            color="blue"
            size="sm"
            onClick={handleDatasetClick}
          >
            <Trans id="dataset.footnotes.dataset">Dataset</Trans>
          </Button>
          <Typography variant="body3">{cube.title}</Typography>
        </Flex>
        <div>
          {canRemove ? (
            <IconButton
              disabled={loading}
              onClick={async () => {
                try {
                  const chartConfig = getChartConfig(state);
                  const newCubes = chartConfig.cubes.filter(
                    (c) => c.iri !== cube.iri
                  );
                  await executeDataCubesComponentsQuery(client, {
                    locale,
                    sourceUrl: state.dataSource.url,
                    sourceType: state.dataSource.type,
                    cubeFilters: newCubes.map((cube) => ({
                      iri: cube.iri,
                      joinBy: newCubes.length > 1 ? cube.joinBy : undefined,
                      loadValues: true,
                    })),
                  });
                  dispatch({
                    type: "DATASET_REMOVE",
                    value: { locale, iri: cube.iri },
                  });
                } catch (e) {
                  console.error(e);
                } finally {
                  setLoading(false);
                }
              }}
              sx={{ padding: 2, transform: "translate(8px, -8px)" }}
            >
              <SvgIcTrash />
            </IconButton>
          ) : null}
        </div>
      </div>
    </MaybeTooltip>
  );
};

export const DatasetsControlSection = () => {
  const [state] = useConfiguratorState(isConfiguring);
  const locale = useLocale();
  const commonQueryVariables = {
    sourceType: state.dataSource.type,
    sourceUrl: state.dataSource.url,
    locale,
  };
  const { setOpen, setActiveSection } = useMetadataPanelStoreActions();
  const cubes = useMemo(() => {
    const activeChartConfig = state.chartConfigs.find(
      (x) => x.key === state.activeChartKey
    );
    const cubes = uniqBy(activeChartConfig?.cubes ?? [], (x) => x.iri);
    return cubes;
  }, [state.activeChartKey, state.chartConfigs]);
  const [metadataQuery] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: cubes.map((cube) => ({
        iri: cube.iri,
      })),
    },
  });
  const {
    isOpen: isDatasetDialogOpen,
    open: openDatasetDialog,
    close: closeDatasetDialog,
  } = useDisclosure();

  const [addedIri, setAddedIri] = useState<string | null>(null);
  useEventEmitter("dataset-added", (ev) => {
    setTimeout(() => {
      setAddedIri(ev.datasetIri);
    }, 300);
    setTimeout(() => {
      setAddedIri(null);
    }, 5000);
  });

  const handleDatasetClick = () => {
    setOpen(true);
    setActiveSection("general");
  };

  return (
    <ControlSection collapse defaultExpanded hideTopBorder>
      <SectionTitle id="controls-data">
        <Trans id="controls.section.datasets.title">Datasets</Trans>{" "}
        <DatasetsBadge sx={{ ml: "auto", mr: 2 }} />
      </SectionTitle>
      <ControlSectionContent
        aria-labelledby="controls-data"
        data-testid="configurator-datasets"
      >
        <Flex sx={{ flexDirection: "column", gap: 6 }}>
          {metadataQuery.data?.dataCubesMetadata.map((cube) => {
            return (
              <DatasetRow
                key={cube.iri}
                handleDatasetClick={handleDatasetClick}
                canRemove={cubes.length > 1}
                added={addedIri === cube.iri}
                cube={cube}
              />
            );
          })}
        </Flex>
        <Flex sx={{ justifyContent: "end" }}>
          <Button
            variant="text"
            size="sm"
            color="blue"
            startIcon={<Icon name="plus" size={20} />}
            onClick={openDatasetDialog}
          >
            {t({ id: "chart.datasets.add", message: "Add dataset" })}
          </Button>
        </Flex>
        <AddDatasetDrawer
          state={state}
          open={isDatasetDialogOpen}
          onClose={closeDatasetDialog}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};
