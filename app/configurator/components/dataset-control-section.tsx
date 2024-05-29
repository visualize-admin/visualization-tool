import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  IconButton,
  Link as MuiLink,
  tooltipClasses,
  Typography,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import uniqBy from "lodash/uniqBy";
import { useEffect, useMemo, useRef, useState } from "react";

import { useMetadataPanelStoreActions } from "@/components/metadata-panel-store";
import useDisclosure from "@/components/use-disclosure";
import { BetaTag } from "@/configurator/components/beta-tag";
import {
  ControlSection,
  ControlSectionContent,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { DataCubeMetadata } from "@/domain/data";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import SvgIcAdd from "@/icons/components/IcAdd";
import SvgIcChecked from "@/icons/components/IcChecked";
import SvgIcTrash from "@/icons/components/IcTrash";
import { useLocale } from "@/locales/use-locale";
import { useEventEmitter } from "@/utils/eventEmitter";
import { MaybeTooltip } from "@/utils/maybe-tooltip";

import { DatasetDialog } from "./add-dataset-dialog";
import { FiltersBadge } from "./filters-badge";

const useStyles = makeStyles((theme: Theme) => ({
  row: {
    borderLeft: "0.25rem solid transparent",
    paddingLeft: "0.25rem",
    marginLeft: "-0.5rem",
    transition: "border-left-color 1s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  added: {
    transition: "border-left-color 0.25s ease",
    borderLeftColor: theme.palette.success.light,
  },
  tooltipPopper: {
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.success.light,
      lineHeight: 1.5,
      padding: "0.75rem",
      whiteSpace: "nowrap",
      maxWidth: "none",
      // color: theme.palette.success.main,
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
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const classes = useStyles();
  const [, dispatch] = useConfiguratorState(isConfiguring);

  useEffect(() => {
    if (added && ref.current) {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }
  });

  return (
    <MaybeTooltip
      title={
        <Box alignItems="center" display="flex" gap="0.75rem">
          <Box color="success.main">
            <SvgIcChecked width={24} height={24} />
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
        ref={ref}
        className={clsx(classes.row, { [classes.added]: added })}
        key={cube.iri}
      >
        <div>
          <MuiLink
            color="primary"
            underline="none"
            sx={{ cursor: "pointer" }}
            variant="caption"
            component="span"
            onClick={handleDatasetClick}
          >
            Dataset
          </MuiLink>
          <br />
          <Typography variant="caption">{cube.title}</Typography>
        </div>
        <div>
          {canRemove ? (
            <IconButton
              onClick={() =>
                dispatch({
                  type: "DATASET_REMOVE",
                  value: { locale, iri: cube.iri },
                })
              }
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
    <ControlSection collapse defaultExpanded={false}>
      <SubsectionTitle titleId="controls-data" gutterBottom={false}>
        <Trans id="controls.section.datasets.title">Data Sources</Trans>{" "}
        <BetaTag
          tagProps={{
            sx: {
              ml: 2,
              fontWeight: "normal",
            },
          }}
        />
        <FiltersBadge sx={{ ml: "auto", mr: 4 }} />
      </SubsectionTitle>
      <ControlSectionContent
        aria-labelledby="controls-data"
        data-testid="configurator-datasets"
      >
        <Box
          sx={{
            gap: "0.5rem",
            mb: "1rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {metadataQuery.data?.dataCubesMetadata.map((x) => {
            return (
              <DatasetRow
                key={x.iri}
                handleDatasetClick={handleDatasetClick}
                canRemove={cubes.length > 1}
                added={addedIri === x.iri}
                cube={x}
              />
            );
          })}
        </Box>
        <Box>
          {cubes.length === 1 ? (
            <Button
              onClick={openDatasetDialog}
              startIcon={<SvgIcAdd />}
              variant="outlined"
              size="small"
            >
              {t({ id: "chart.datasets.add", message: "Add dataset" })}
            </Button>
          ) : null}
        </Box>
        <DatasetDialog
          state={state}
          open={isDatasetDialogOpen}
          onClose={closeDatasetDialog}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};
