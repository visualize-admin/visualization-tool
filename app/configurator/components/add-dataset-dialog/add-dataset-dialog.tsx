import { t, Trans } from "@lingui/macro";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  DialogContent,
  DialogProps,
  DialogTitle,
  DrawerProps,
  Grow,
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
import keyBy from "lodash/keyBy";
import uniq from "lodash/uniq";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useClient } from "urql";

import {
  DatasetResults,
  PartialSearchCube,
  SearchDatasetDraftsControl,
  SearchDatasetResultsCount,
  SearchDatasetSortControl,
} from "@/browser/dataset-browse";
import { getEnabledChartTypes } from "@/charts";
import Flex from "@/components/flex";
import Tag from "@/components/tag";
import { ConfiguratorStateConfiguringChart } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { RightDrawer } from "@/configurator/components/drawers";
import {
  CautionAlert,
  useCautionAlert,
} from "@/configurator/components/add-dataset-dialog/caution-alert";
import {
  inferJoinBy,
  JoinBy,
} from "@/configurator/components/add-dataset-dialog/infer-join-by";
import PreviewDataTable from "@/configurator/components/add-dataset-dialog/preview-table";
import { SearchOptions } from "@/configurator/components/add-dataset-dialog/types";
import {
  addDatasetInConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import {
  ComponentTermsets,
  Dimension,
  isTemporalDimensionWithTimeUnit,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  executeDataCubesComponentsQuery,
  useDataCubesComponentsQuery,
} from "@/graphql/hooks";
import { ComponentId } from "@/graphql/make-component-id";
import {
  SearchCubeFilterType,
  SearchCubeResultOrder,
  useDataCubeComponentTermsetsQuery,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";
import SvgIcClose from "@/icons/components/IcClose";
import SvgIcFilter from "@/icons/components/IcFilter";
import SvgIcInfoCircle from "@/icons/components/IcInfoCircle";
import SvgIcSearch from "@/icons/components/IcSearch";
import { Locale } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";
import { useEventEmitter } from "@/utils/eventEmitter";
import useEvent from "@/utils/use-event";

import useStyles from "./use-styles";

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
    >
      <SvgIcClose width={24} height={24} fontSize={24} />
    </IconButton>
  );
};

const extractSearchDimensions = (
  dimensions: Dimension[],
  termsets: ComponentTermsets[]
): SearchOptions[] => {
  const temporalDimensions =
    dimensions.filter(isTemporalDimensionWithTimeUnit) ?? [];
  const sharedDimensions = termsets ?? [];
  const sharedDimensionIds = sharedDimensions.map((dim) => dim.iri);

  return [
    ...temporalDimensions
      // There are cases, e.g. for AMDP cubes, that a temporal dimension contains
      // termsets (TemporalEntityDimension). When this happens, we prefer to show
      // the dimension as a shared dimension.
      .filter((dim) => !sharedDimensionIds.includes(dim.id))
      .map((x) => {
        return {
          type: "temporal" as const,
          id: x.id as ComponentId,
          originalIds: x.originalIds ?? [],
          label: x.label,
          timeUnit: x.timeUnit,
        };
      }),
    ...sharedDimensions.map((x) => {
      return {
        type: "shared" as const,
        id: x.iri,
        label: x.label,
        termsets: x.termsets,
      };
    }),
  ];
};

const useMergeDatasetsData = ({
  state,
  locale,
  pause,
}: {
  state: ConfiguratorStateConfiguringChart;
  locale: Locale;
  pause: boolean;
}) => {
  const commonQueryVariables = {
    sourceType: state.dataSource.type,
    sourceUrl: state.dataSource.url,
    locale,
  };

  const activeChartConfig = state.chartConfigs.find(
    (chartConfig) => chartConfig.key === state.activeChartKey
  );

  if (!activeChartConfig) {
    throw Error("Could not find active chart config");
  }

  const currentCubes = activeChartConfig.cubes;

  // Getting cube dimensions, to find temporal dimensions
  const [cubesComponentQuery] = useDataCubesComponentsQuery({
    pause: pause,
    variables: {
      ...commonQueryVariables,
      cubeFilters: currentCubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
      })),
    },
  });

  // Getting cube termsets, to then search for cubes with at least one matching termset
  // TODO The cube filters should use all of the cubes and not just the first one
  const [cubeComponentTermsets] = useDataCubeComponentTermsetsQuery({
    pause: pause,
    variables: {
      locale,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      cubeFilter: {
        iri: currentCubes[0].iri,
      },
    },
  });

  return {
    components: cubesComponentQuery.data?.dataCubesComponents,
    dimensions: cubesComponentQuery.data?.dataCubesComponents.dimensions ?? [],
    termsets: cubeComponentTermsets.data?.dataCubeComponentTermsets ?? [],
    fetching: cubesComponentQuery.fetching || cubeComponentTermsets.fetching,
    ready:
      cubesComponentQuery.data !== undefined &&
      cubeComponentTermsets.data !== undefined,
  };
};

type SearchDimension = ReturnType<typeof extractSearchDimensions>[number];
const isTemporalDimension = (
  x: SearchDimension
): x is Extract<SearchDimension, { type: "temporal" }> => x.type === "temporal";

const isSharedDimension = (
  x: SearchDimension
): x is Extract<SearchDimension, { type: "shared" }> => x.type === "shared";

export const DatasetDialog = ({
  state,
  ...props
}: {
  state: ConfiguratorStateConfiguringChart;
} & DrawerProps) => {
  const locale = useLocale();
  const classes = useStyles();

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<SearchCubeResultOrder>(
    SearchCubeResultOrder.Score
  );
  const [includeDrafts, setIncludeDrafts] = useState(false);

  const activeChartConfig = state.chartConfigs.find(
    (chartConfig) => chartConfig.key === state.activeChartKey
  );

  if (!activeChartConfig) {
    throw Error("Could not find active chart config");
  }

  const currentCubes = activeChartConfig.cubes;

  // Getting cube dimensions, to find temporal dimensions
  const {
    dimensions,
    termsets,
    components,
    ready: isMergeDatasetDataReady,
    fetching: isMergeDatasetsDataFetching,
  } = useMergeDatasetsData({
    state,
    locale,
    pause: !props.open,
  });
  const { searchDimensionOptions, searchDimensionOptionsById } = useMemo(() => {
    const options = extractSearchDimensions(dimensions, termsets);
    return {
      searchDimensionOptions: options,
      searchDimensionOptionsById: keyBy(options, (x) => x.id),
    };
  }, [dimensions, termsets]);

  const [selectedSearchDimensions, setSelectedSearchDimensions] = useState<
    typeof searchDimensionOptions | undefined
  >(undefined);

  const handleChangeSearchDimensions = (ev: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = ev;
    setSelectedSearchDimensions(
      // On autofill we get a stringified value.
      (typeof value === "string" ? value.split(",") : value)
        ?.map((x) => {
          return searchDimensionOptionsById[x];
        })
        .filter(truthy)
    );
  };

  const selectedSharedDimensions =
    selectedSearchDimensions?.filter(isSharedDimension);

  const selectedTemporalDimension = (selectedSearchDimensions ?? []).find(
    isTemporalDimension
  );

  const isSearchQueryPaused =
    !isMergeDatasetDataReady || !selectedSearchDimensions?.length;

  const [searchQuery] = useSearchCubesQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      query,
      order,
      includeDrafts,
      fetchDimensionTermsets: true,
      filters: [
        selectedTemporalDimension
          ? {
              type: SearchCubeFilterType.TemporalDimension,
              value: selectedTemporalDimension.timeUnit,
            }
          : null,
        selectedSharedDimensions && selectedSharedDimensions.length > 0
          ? {
              type: SearchCubeFilterType.DataCubeTermset,
              value: uniq(
                selectedSharedDimensions.flatMap((x) =>
                  x.termsets.map((x) => x.iri)
                )
              ).join(";"),
            }
          : null,
      ].filter(truthy),
    },
    pause: isSearchQueryPaused,
  });

  const searchCubes = useMemo(() => {
    const relevantCubeIris = currentCubes.map((d) => d.iri);
    return (
      searchQuery.data?.searchCubes.filter(
        (d) => !relevantCubeIris.includes(d.cube.iri)
      ) ?? []
    );
  }, [currentCubes, searchQuery.data?.searchCubes]);

  const handleSubmit = useEvent((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    );
    setQuery(formData.search as string);
  });

  const handleClose: DialogProps["onClose"] = useEventCallback((ev, reason) => {
    props.onClose?.(ev, reason);
    setQuery("");
    setSelectedSearchDimensions(undefined);
    setOtherCube(undefined);
  });

  // Initial setting of the selected search dimensions
  useEffect(() => {
    if (selectedSearchDimensions === undefined && termsets && components) {
      setSelectedSearchDimensions(searchDimensionOptions);
    }
  }, [components, searchDimensionOptions, selectedSearchDimensions, termsets]);

  const [otherCube, setOtherCube] = useState<PartialSearchCube>();

  const [{ fetching: addingDataset }, { addDataset }] = useAddDataset();

  const handleClickOtherCube = (otherCube: PartialSearchCube) => {
    setOtherCube(otherCube);
  };

  const { isOpen, open, close } = useCautionAlert();

  const ee = useEventEmitter();

  const inferredJoinBy = useMemo(
    () =>
      otherCube
        ? inferJoinBy(selectedSearchDimensions ?? [], otherCube)
        : undefined,
    [selectedSearchDimensions, otherCube]
  );

  const handleConfirm = useEventCallback(async () => {
    if (!components || !otherCube || !inferredJoinBy) {
      return null;
    }

    await addDataset({
      joinBy: inferredJoinBy,
      otherCube: otherCube,
    });
    handleClose({}, "escapeKeyDown");

    setTimeout(() => {
      ee.emit("dataset-added", { datasetIri: otherCube.iri });
    }, 100);
  });

  return (
    <RightDrawer {...props} onClose={handleClose}>
      <Box className={classes.dialogCloseArea}>
        {otherCube ? null : (
          <Grow in={!isOpen}>
            <IconButton onClick={() => open()}>
              <SvgIcInfoCircle />
            </IconButton>
          </Grow>
        )}
        <DialogCloseButton
          onClick={(ev) => handleClose(ev, "escapeKeyDown")}
          sx={{ position: "static" }}
        />
      </Box>
      {otherCube ? null : (
        <>
          <DialogTitle sx={{ typography: "h2" }}>
            {t({
              id: "chart.datasets.add-dataset-dialog.title",
              message: "Select dataset with shared dimensions",
            })}
          </DialogTitle>
          <DialogContent>
            <Collapse in={isOpen}>
              <Box sx={{ mb: 4 }}>
                <CautionAlert onConfirm={close} />
              </Box>
            </Collapse>
            <Typography variant="body1" mb="2rem">
              <Trans id="chart.datasets.add-dataset-dialog.description">
                You can only combine datasets that share dimensions with the
                same unit and resolution. By default, dimensions matching the
                current chart are selected.
              </Trans>
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              component="form"
              gap="0.5rem"
              mb="1rem"
              onSubmit={handleSubmit}
            >
              <TextField
                size="small"
                name="search"
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
                value={(selectedSearchDimensions ?? []).map((x) => x.id)}
                onChange={handleChangeSearchDimensions}
                MenuProps={{
                  PaperProps: {
                    style: {
                      width: 300,
                      marginTop: "0.5rem",
                      marginLeft: "-1rem",
                    },
                  },
                }}
                input={
                  <OutlinedInput
                    id="select-multiple-chip"
                    label="Chip"
                    notched={false}
                    startAdornment={
                      <InputAdornment position="start" sx={{ mr: 0 }}>
                        <SvgIcFilter />
                      </InputAdornment>
                    }
                    style={{ width: "100%" }}
                  />
                }
                renderValue={(selected) =>
                  isMergeDatasetsDataFetching ? (
                    <CircularProgress size={12} />
                  ) : selected.length === 0 ? (
                    <Typography variant="body2">
                      {t({
                        id: "dataset.search.search-options.no-options-selected",
                      })}
                    </Typography>
                  ) : (
                    selected.map((id, i) => {
                      const value = searchDimensionOptionsById[id];
                      return i < 2 ? (
                        <Tag key={value.id} type="dimension" sx={{ mr: 1 }}>
                          {value.label}
                        </Tag>
                      ) : i === 2 ? (
                        <Tag key="more" type="dimension" sx={{ mr: 1 }}>
                          <Trans id="dataset.search.search-options.more-2-options-selected">
                            {selected.length - 2} more
                          </Trans>
                        </Tag>
                      ) : null;
                    })
                  )
                }
              >
                {searchDimensionOptions.map((sd) => (
                  <MenuItem
                    key={sd.label}
                    value={sd.id}
                    sx={{ gap: 2, alignItems: "start" }}
                  >
                    <Checkbox
                      checked={
                        selectedSearchDimensions &&
                        !!selectedSearchDimensions.find((x) => x.id === sd.id)
                      }
                    />
                    <ListItemText
                      primary={<Tag type="dimension">{sd.label}</Tag>}
                    />
                  </MenuItem>
                ))}
              </Select>
              <Button
                color="blue"
                type="submit"
                variant="contained"
                style={{ minWidth: "fit-content" }}
              >
                {t({ id: "dataset.search.label" })}
              </Button>
            </Box>

            <Flex
              style={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <SearchDatasetResultsCount cubes={searchCubes} />
              <Flex style={{ alignItems: "center" }}>
                <SearchDatasetDraftsControl
                  checked={includeDrafts}
                  onChange={setIncludeDrafts}
                />
                <SearchDatasetSortControl value={order} onChange={setOrder} />
              </Flex>
            </Flex>

            {selectedSearchDimensions?.length === 0 ? (
              <Typography variant="body1">
                <Trans id="dataset.search.at-least-one-compatible-dimension-selected">
                  At least one compatible dimension must be selected.
                </Trans>
              </Typography>
            ) : (
              <DatasetResults
                cubes={searchCubes}
                fetching={searchQuery.fetching || isMergeDatasetsDataFetching}
                error={searchQuery.error}
                datasetResultProps={({ cube }) => ({
                  disableTitleLink: true,
                  showDimensions: true,
                  showTags: true,
                  rowActions: () => {
                    return (
                      <Box display="flex" justifyContent="flex-end">
                        <LoadingButton
                          size="sm"
                          variant="outlined"
                          className={classes.addButton}
                          onClick={() => handleClickOtherCube(cube)}
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
            )}
          </DialogContent>
        </>
      )}
      {otherCube && inferredJoinBy ? (
        <PreviewDataTable
          key={otherCube.iri}
          dataSource={state.dataSource}
          currentComponents={components}
          existingCubes={currentCubes}
          otherCube={otherCube}
          inferredJoinBy={inferredJoinBy}
          addingDataset={addingDataset}
          onConfirm={handleConfirm}
          onClickBack={() => setOtherCube(undefined)}
          searchDimensionsSelected={selectedSearchDimensions ?? []}
        />
      ) : null}
    </RightDrawer>
  );
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
      otherCube,
      joinBy,
    }: {
      otherCube: PartialSearchCube;
      joinBy: JoinBy;
    }) => {
      const iri = otherCube.iri;
      setHookState((hs) => ({ ...hs, fetching: true, otherIri: iri }));
      try {
        const addDatasetOptions = {
          iri,
          joinBy: joinBy,
        };
        const nextState = JSON.parse(
          JSON.stringify(state)
        ) as ConfiguratorStateConfiguringChart;
        addDatasetInConfig(nextState, addDatasetOptions);
        const chartConfig = getChartConfig(nextState, state.activeChartKey);

        const res = await executeDataCubesComponentsQuery(client, {
          locale,
          sourceType,
          sourceUrl,
          cubeFilters: chartConfig.cubes.map((cube) => ({
            iri: cube.iri,
            joinBy: cube.joinBy,
            componentIds: undefined,
            loadValues: true,
          })),
        });

        if (res.error || !res.data) {
          throw Error("Could not fetch dimensions and measures");
        }

        dispatch({
          type: "DATASET_ADD",
          value: addDatasetOptions,
        });
        const { dimensions, measures } = res.data.dataCubesComponents;
        const { enabledChartTypes } = getEnabledChartTypes({
          dimensions,
          measures,
          cubeCount: chartConfig.cubes.length,
        });
        dispatch({
          type: "CHART_TYPE_CHANGED",
          value: {
            locale,
            chartKey: state.activeChartKey,
            chartType: enabledChartTypes[0],
            isAddingNewCube: true,
          },
        });
      } finally {
        setHookState((hs) => ({ ...hs, fetching: false, otherIri: null }));
      }
    }
  );

  return [hookState, { addDataset }] as const;
};
