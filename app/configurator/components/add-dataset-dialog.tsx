import { t } from "@lingui/macro";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  IconButtonProps,
  InputAdornment,
  TextField,
  useEventCallback,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import uniqBy from "lodash/uniqBy";
import { FormEvent, useMemo, useState } from "react";

import { DatasetResults, PartialSearchCube } from "@/browser/dataset-browse";
import { getPossibleChartTypes } from "@/charts";
import {
  ConfiguratorStateConfiguringChart,
  addDatasetInConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { DataCubeComponents } from "@/domain/data";
import {
  executeDataCubesComponentsQuery,
  useDataCubesComponentsQuery,
} from "@/graphql/hooks";
import {
  SearchCubeResultOrder,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";
import SvgIcRemove from "@/icons/components/IcRemove";
import SvgIcSearch from "@/icons/components/IcSearch";
import { useLocale } from "@/locales/use-locale";

const DialogCloseButton = (props: IconButtonProps) => {
  return (
    <IconButton
      {...props}
      sx={{
        position: "absolute",
        top: "1.5rem",
        right: "1.5rem",
        ...props.sx,
      }}
      size="small"
    >
      <SvgIcRemove width={24} height={24} fontSize={24} />
    </IconButton>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  datasetResult: {
    cursor: "pointer",
    "--addButtonBackground": theme.palette.primary.main,
    "&:hover": {
      "--addButtonBackground": theme.palette.primary.dark,
    },
  },
  addButton: {
    transition: "opacity 0.25s ease",
    background: "var(--addButtonBackground)",
  },
}));

export const DatasetDialog = ({
  state,
  ...props
}: { state: ConfiguratorStateConfiguringChart } & DialogProps) => {
  const [query, setQuery] = useState("");
  const locale = useLocale();
  const classes = useStyles();

  const commonQueryVariables = {
    sourceType: state.dataSource.type,
    sourceUrl: state.dataSource.url,
    locale,
  };

  const activeChartConfig = state.chartConfigs.find(
    (x) => x.key === state.activeChartKey
  );
  if (!activeChartConfig) {
    throw new Error("Could not find active chart config");
  }
  const [cubesComponentQuery] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: activeChartConfig.cubes.slice(0, 1).map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
      })),
    },
  });

  const relevantDimensions = useMemo(() => {
    return (
      cubesComponentQuery.data?.dataCubesComponents.dimensions.filter((x) => {
        return x.__typename === "TemporalDimension";
      }) ?? []
    );
  }, [cubesComponentQuery.data?.dataCubesComponents.dimensions]);

  const [searchQuery] = useSearchCubesQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      query: query,
      order: SearchCubeResultOrder.Score,
      includeDrafts: false,
      filters: relevantDimensions.flatMap((rd) =>
        rd.__typename === "TemporalDimension"
          ? [{ type: "TemporalDimension", value: rd.timeUnit }]
          : []
      ),
    },
    pause: !cubesComponentQuery.data || relevantDimensions.length === 0,
  });

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(ev.currentTarget).entries()
    );
    setQuery(formdata.search as string);
  };

  const handleClose: DialogProps["onClose"] = useEventCallback((ev, reason) => {
    props.onClose?.(ev, reason);
    setQuery("");
  });
  const currentComponents = cubesComponentQuery.data?.dataCubesComponents;

  const { loading, addDataset } = useAddDataset();

  return (
    <Dialog
      {...props}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: "calc(100vh - calc(30px * 2))" },
      }}
    >
      <DialogCloseButton onClick={(ev) => handleClose(ev, "escapeKeyDown")} />
      <DialogTitle sx={{ typography: "h2" }}>
        {t({
          id: "chart.datasets.add-dataset-dialog.title",
          message: "Select dataset with shared dimensions",
        })}
      </DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          alignItems="center"
          component="form"
          gap="0.25rem"
          mb="1.5rem"
          onSubmit={handleSubmit}
        >
          <TextField
            size="small"
            name="search"
            sx={{ width: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SvgIcSearch />
                </InputAdornment>
              ),
            }}
            placeholder={t({ id: "dataset.search.placeholder" })}
          />
          <Button
            color="primary"
            type="submit"
            variant="contained"
            size="small"
          >
            {t({ id: "dataset.search.label" })}
          </Button>
        </Box>
        <DatasetResults
          cubes={searchQuery.data?.searchCubes ?? []}
          fetching={searchQuery.fetching}
          error={searchQuery.error}
          datasetResultProps={({ cube }) => ({
            disableTitleLink: true,
            className: classes.datasetResult,
            onClick: () => {
              if (!currentComponents) {
                return null;
              }
              return addDataset({
                currentComponents,
                otherCube: cube,
              });
            },
            rowActions: () => {
              return (
                <Box display="flex" justifyContent="flex-end">
                  <LoadingButton
                    loading={loading}
                    size="small"
                    variant="contained"
                    className={classes.addButton}
                  >
                    {t({
                      id: "dataset.search.add-dataset",
                      message: "Add dataset",
                    })}
                  </LoadingButton>
                </Box>
              );
            },
          })}
        />
      </DialogContent>
    </Dialog>
  );
};

const inferJoinBy = (
  leftComponents: DataCubeComponents,
  rightComponents: DataCubeComponents
) => {
  const leftDim = leftComponents.dimensions.find(
    (x) => x.__typename === "TemporalDimension"
  );
  const rightDim = rightComponents.dimensions.find(
    (x) => x.__typename === "TemporalDimension"
  );
  if (!leftDim?.iri || !rightDim?.iri) {
    throw new Error(
      `Could not find dimensions on which to join: ${JSON.stringify({
        leftDim,
        rightDim,
      })}`
    );
  }

  return {
    left: leftDim.iri,
    right: rightDim.iri,
  };
};

const useAddDataset = () => {
  const [loading, setLoading] = useState(false);
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const { type: sourceType, url: sourceUrl } = state.dataSource;
  const locale = useLocale();
  const addDataset = useEventCallback(
    async ({
      currentComponents,
      otherCube,
    }: {
      currentComponents: DataCubeComponents;
      otherCube: PartialSearchCube;
    }) => {
      const iri = otherCube.iri;
      setLoading(true);
      try {
        const componentQueryResult = await executeDataCubesComponentsQuery({
          locale: locale,
          sourceType,
          sourceUrl,
          cubeFilters: [{ iri }],
        });

        if (componentQueryResult.error || !componentQueryResult.data) {
          throw new Error(
            `Could not fetch cube to add: ${componentQueryResult.error}`
          );
        }

        const joinBy = inferJoinBy(
          currentComponents,
          componentQueryResult.data.dataCubesComponents
        );

        const addDatasetOptions = {
          iri,
          joinBy: joinBy,
        };
        const nextState = JSON.parse(
          JSON.stringify(state)
        ) as ConfiguratorStateConfiguringChart;
        addDatasetInConfig(nextState, addDatasetOptions);

        const allCubes = uniqBy(
          nextState.chartConfigs.flatMap((x) => x.cubes),
          (x) => x.iri
        );
        const res = await executeDataCubesComponentsQuery({
          locale: locale,
          sourceType,
          sourceUrl,
          cubeFilters: allCubes.map((cube) => ({
            iri: cube.iri,
            joinBy: cube.joinBy,
            loadValues: true,
          })),
        });

        if (res.error || !res.data) {
          throw new Error("Could not fetch dimensions and measures");
        }
        dispatch({
          type: "DATASET_ADD",
          value: addDatasetOptions,
        });
        const { dimensions, measures } = res.data.dataCubesComponents;
        const possibleType = getPossibleChartTypes({
          dimensions: dimensions,
          measures: measures,
          cubeCount: allCubes.length,
        });
        dispatch({
          type: "CHART_TYPE_CHANGED",
          value: {
            locale,
            chartKey: state.activeChartKey,
            chartType: possibleType[0],
          },
        });
      } finally {
        setLoading(false);
      }
    }
  );

  return { addDataset, loading };
};
