import { Trans, t } from "@lingui/macro";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  IconButtonProps,
  InputAdornment,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useEventCallback,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import keyBy from "lodash/keyBy";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useClient } from "urql";

import { DatasetResults, PartialSearchCube } from "@/browser/dataset-browse";
import { getPossibleChartTypes } from "@/charts";
import Tag from "@/components/tag";
import {
  ConfiguratorStateConfiguringChart,
  addDatasetInConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import {
  DataCubeComponents,
  Termset,
  isTemporalDimensionWithTimeUnit,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  executeDataCubesComponentsQuery,
  useDataCubesComponentsQuery,
} from "@/graphql/hooks";
import {
  SearchCubeFilterType,
  SearchCubeResultOrder,
  useDataCubeComponentTermsetsQuery,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";
import SvgIcFilter from "@/icons/components/IcFilter";
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

const useStyles = makeStyles(() => ({
  addButton: {
    transition: "opacity 0.25s ease",
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

  const relevantCubes = activeChartConfig.cubes.slice(0, 1);

  const [sharedTermsets, setSharedTermsets] = useState<
    Termset["iri"][] | undefined
  >(undefined);

  // Getting cube dimensions, to find temporal dimensions
  const [cubesComponentQuery] = useDataCubesComponentsQuery({
    pause: !props.open,
    variables: {
      ...commonQueryVariables,
      cubeFilters: relevantCubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
      })),
    },
  });

  // Getting cube termsets, to then search for cubes with at least one this termset
  const [cubeTermsetsResults] = useDataCubeComponentTermsetsQuery({
    pause: !props.open,
    variables: {
      locale,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      cubeFilter: {
        iri: relevantCubes[0].iri,
      },
    },
  });
  const cubeTermsetsByIri = keyBy(
    cubeTermsetsResults.data?.dataCubeComponentTermsets.flatMap(
      (x) => x.termsets
    ) ?? [],
    (x) => x.iri
  );

  const relevantDimensions = useMemo(() => {
    return (
      cubesComponentQuery.data?.dataCubesComponents.dimensions.filter(
        isTemporalDimensionWithTimeUnit
      ) ?? []
    );
  }, [cubesComponentQuery.data?.dataCubesComponents.dimensions]);

  const temporalDimension = relevantDimensions.find(
    isTemporalDimensionWithTimeUnit
  );

  const isSearchQueryPaused = !cubesComponentQuery.data;
  const [searchQuery] = useSearchCubesQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      query: query,
      order: SearchCubeResultOrder.Score,
      includeDrafts: false,
      filters: [
        temporalDimension
          ? {
              type: SearchCubeFilterType.TemporalDimension,
              value: temporalDimension.timeUnit,
            }
          : null,
        sharedTermsets
          ? {
              type: SearchCubeFilterType.SharedDimensions,
              value: sharedTermsets.join(";"),
            }
          : null,
      ].filter(truthy),
    },
    pause: isSearchQueryPaused,
  });

  const currentComponents = cubesComponentQuery.data?.dataCubesComponents;
  const [{ fetching, otherIri }, { addDataset }] = useAddDataset();

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

  const handleChangeSharedDimensions = (
    ev: SelectChangeEvent<typeof sharedTermsets>
  ) => {
    const {
      target: { value },
    } = ev;
    setSharedTermsets(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const uniqueTermsets = useMemo(() => {
    return uniq(
      cubeTermsetsResults.data?.dataCubeComponentTermsets.map((sd) => sd.iri)
    );
  }, [cubeTermsetsResults.data?.dataCubeComponentTermsets]);

  useEffect(() => {
    if (sharedTermsets === undefined && uniqueTermsets) {
      setSharedTermsets(uniqueTermsets.map((sd) => sd));
    }
  }, [cubeTermsetsResults, sharedTermsets, uniqueTermsets]);

  const searchCubes = useMemo(() => {
    const relevantCubeIris = relevantCubes.map((d) => d.iri);
    return (
      searchQuery.data?.searchCubes.filter(
        (d) => !relevantCubeIris.includes(d.cube.iri)
      ) ?? []
    );
  }, [relevantCubes, searchQuery.data?.searchCubes]);

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
        <Typography variant="body1" mb="2rem">
          <Trans id="chart.datasets.add-dataset-dialog.description">
            You can only combine datasets that share dimensions with the same
            unit and resolution. By default, dimensions matching the current
            chart are selected.
          </Trans>
        </Typography>
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
          <Select
            multiple
            value={sharedTermsets ?? []}
            onChange={handleChangeSharedDimensions}
            input={
              <OutlinedInput
                notched={false}
                startAdornment={
                  <InputAdornment position="start">
                    <SvgIcFilter />
                  </InputAdornment>
                }
                id="select-multiple-chip"
                label="Chip"
              />
            }
            sx={{ minWidth: 300 }}
            renderValue={(selected) =>
              cubeTermsetsResults.fetching ? (
                <CircularProgress size={12} />
              ) : selected.length === 0 ? (
                <Typography variant="body2">Nothing selected</Typography>
              ) : (
                selected.map((value, i) =>
                  i < 2 ? (
                    <Tag key={value} type="termset" sx={{ mr: 1 }}>
                      {cubeTermsetsByIri?.[value]?.label}
                    </Tag>
                  ) : i === 2 ? (
                    <Tag key={value} type="termset" sx={{ mr: 1 }}>
                      {selected.length - 2} more
                    </Tag>
                  ) : null
                )
              )
            }
          >
            {cubeTermsetsResults?.data?.dataCubeComponentTermsets
              .flatMap((x) => x.termsets)
              ?.map((sd) => (
                <MenuItem
                  key={sd.label}
                  value={sd.iri}
                  sx={{ gap: 2, alignItems: "start" }}
                >
                  <Checkbox
                    checked={sharedTermsets && sharedTermsets.includes(sd.iri)}
                  />
                  <ListItemText primary={sd.label} />
                </MenuItem>
              ))}
          </Select>
          <Button color="primary" type="submit" variant="contained">
            {t({ id: "dataset.search.label" })}
          </Button>
        </Box>
        <DatasetResults
          cubes={searchCubes ?? []}
          fetching={searchQuery.fetching}
          error={searchQuery.error}
          datasetResultProps={({ cube }) => ({
            disableTitleLink: true,
            showTermsets: true,
            showTags: true,
            onClick: async (ev) => {
              if (!currentComponents) {
                return null;
              }
              await addDataset({
                currentTermsets: (sharedTermsets ?? []).map(
                  (iri) => cubeTermsetsByIri[iri]
                ),
                currentComponents,
                otherCube: cube,
              });
              handleClose(ev, "escapeKeyDown");
            },
            rowActions: () => {
              return (
                <Box display="flex" justifyContent="flex-end">
                  <LoadingButton
                    loading={fetching && otherIri === cube.iri}
                    size="small"
                    variant="outlined"
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
    isTemporalDimensionWithTimeUnit
  );
  const rightDim = rightComponents.dimensions.find(
    isTemporalDimensionWithTimeUnit
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

/**
 * Adds a dataset to the current chart configuration.
 * Is currently responsible for finding the correct joinBy dimension.
 */
const useAddDataset = () => {
  const [hookState, setHookState] = useState({
    fetching: false,
    otherIri: null as null | string,
  });
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const { type: sourceType, url: sourceUrl } = state.dataSource;
  const locale = useLocale();
  const client = useClient();
  const addDataset = useEventCallback(
    async ({
      currentTermsets,
      currentComponents,
      otherCube,
    }: {
      currentTermsets: Termset[];
      currentComponents: DataCubeComponents;
      otherCube: PartialSearchCube;
    }) => {
      currentTermsets;
      const iri = otherCube.iri;
      setHookState((hs) => ({ ...hs, fetching: true, otherIri: iri }));
      try {
        const componentQueryResult = await executeDataCubesComponentsQuery(
          client,
          {
            locale: locale,
            sourceType,
            sourceUrl,
            cubeFilters: [{ iri }],
          }
        );

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
        const res = await executeDataCubesComponentsQuery(client, {
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
        setHookState((hs) => ({ ...hs, fetching: false, otherIri: null }));
      }
    }
  );

  return [hookState, { addDataset }] as const;
};
