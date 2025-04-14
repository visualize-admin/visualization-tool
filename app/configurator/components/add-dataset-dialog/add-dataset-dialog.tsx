import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  CircularProgress,
  Collapse,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  Grow,
  IconButton,
  IconButtonProps,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useEventCallback,
  Input,
} from "@mui/material";
import keyBy from "lodash/keyBy";
import uniq from "lodash/uniq";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  DatasetResults,
  PartialSearchCube,
  SearchDatasetDraftsControl,
  SearchDatasetResultsCount,
  SearchDatasetSortControl,
} from "@/browser/dataset-browse";
import Flex from "@/components/flex";
import Tag from "@/components/tag";
import { ConfiguratorStateConfiguringChart } from "@/config-types";
import {
  CautionAlert,
  useCautionAlert,
} from "@/configurator/components/add-dataset-dialog/caution-alert";
import { inferJoinBy } from "@/configurator/components/add-dataset-dialog/infer-join-by";
import PreviewDataTable from "@/configurator/components/add-dataset-dialog/preview-table";
import { SearchOptions } from "@/configurator/components/add-dataset-dialog/types";
import useAddDataset from "@/configurator/components/add-dataset-dialog/use-add-dataset";
import {
  ComponentTermsets,
  Dimension,
  isTemporalDimensionWithTimeUnit,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  useDataCubesComponentsQuery,
  useDataCubesComponentTermsetsQuery,
} from "@/graphql/hooks";
import { ComponentId, parseComponentId } from "@/graphql/make-component-id";
import {
  SearchCubeFilterType,
  SearchCubeResultOrder,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";
import SvgIcClose from "@/icons/components/IcClose";
import SvgIcInfoCircle from "@/icons/components/IcInfoCircle";
import { Locale } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";
import { useEventEmitter } from "@/utils/eventEmitter";
import useEvent from "@/utils/use-event";

import useStyles from "./use-styles";
import groupBy from "lodash/groupBy";
import { RightDrawer } from "@/configurator/components/drawers";
import VisuallyHidden from "@/components/visually-hidden";
import { Icon } from "@/icons";

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

const extractSearchOptions = (
  dimensions: Dimension[],
  termsets: ComponentTermsets[]
): SearchOptions[] => {
  const temporalDimensions =
    dimensions.filter(isTemporalDimensionWithTimeUnit) ?? [];
  const sharedDimensions = termsets ?? [];
  const sharedDimensionsByFirstTermset = groupBy(
    sharedDimensions,
    (x) => x.termsets[0].iri
  );
  const sharedDimensionIds = sharedDimensions.map((dim) => dim.iri);
  const sharedDimensionHasBeenAdded = new Set();

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
          originalIds: x.originalIds ?? [
            {
              cubeIri: x.cubeIri,
              dimensionId: x.id,
            },
          ],
          label: x.label,
          timeUnit: x.timeUnit,
        };
      }),
    ...sharedDimensions
      .map((x) => {
        const parsedIri = parseComponentId(x.iri as ComponentId);
        const firstTermset = x.termsets[0].iri;
        const hasBeenAdded = sharedDimensionHasBeenAdded.has(firstTermset);
        if (!parsedIri || hasBeenAdded) {
          return;
        }

        sharedDimensionHasBeenAdded.add(firstTermset);

        const allDimensions = sharedDimensionsByFirstTermset[firstTermset];
        const label = allDimensions.map((d) => d.label).join(", ");
        const originalIds = allDimensions.map((ct) => {
          return {
            cubeIri: ct.cubeIri,
            dimensionId: ct.iri as ComponentId,
          };
        });

        return {
          type: "shared" as const,
          id: x.iri,
          label: label,
          termsets: x.termsets,
          originalIds,
        };
      })
      .filter(truthy),
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
  const [cubeComponentTermsets] = useDataCubesComponentTermsetsQuery({
    pause: pause,
    variables: {
      locale,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      cubeFilters: currentCubes.map((cube) => ({ iri: cube.iri })),
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

type SearchDimension = ReturnType<typeof extractSearchOptions>[number];
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
} & DialogProps) => {
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
  console.log(currentCubes);

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

  const [otherCube, setOtherCube] = useState<PartialSearchCube>();
  const [{ fetching: addingDataset }, { addDataset }] = useAddDataset();

  const { searchDimensionOptions, searchDimensionOptionsById } = useMemo(() => {
    const options = extractSearchOptions(dimensions, termsets);
    return {
      searchDimensionOptions: options,
      searchDimensionOptionsById: keyBy(options, (x) => x.id),
    };
  }, [dimensions, termsets]);

  const [selectedSearchDimensions, setSelectedSearchDimensions] = useState<
    typeof searchDimensionOptions | undefined
  >(undefined);

  // Initial setting of the selected search dimensions
  useEffect(() => {
    if (selectedSearchDimensions === undefined && termsets && components) {
      setSelectedSearchDimensions(searchDimensionOptions);
    }
  }, [components, searchDimensionOptions, selectedSearchDimensions, termsets]);

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

  const rawSearchCubes = useMemo(() => {
    const relevantCubeIris = currentCubes.map((d) => d.iri);
    return (
      searchQuery.data?.searchCubes.filter(
        (d) => !relevantCubeIris.includes(d.cube.iri)
      ) ?? []
    );
  }, [currentCubes, searchQuery.data?.searchCubes]);

  const searchCubes = useMemo(() => {
    if (currentCubes.length === 1) {
      return rawSearchCubes;
    } else {
      return rawSearchCubes.filter((result) => {
        const inferred = inferJoinBy(
          selectedSearchDimensions ?? [],
          result.cube
        );
        const resultJoinBy = inferred[result.cube.iri];

        // TODO Verify that this is correct
        // The idea is that we want to be sure that the cube has the same join by dimensions
        // as the other cubes
        return (
          (resultJoinBy &&
            resultJoinBy.length === selectedSearchDimensions?.length) ??
          0
        );
      });
    }
  }, [rawSearchCubes, currentCubes, selectedSearchDimensions]);

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

  const inputRef = useRef<HTMLInputElement>();

  const handleKeyDown = useEventCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        setQuery(e.currentTarget.value);
      }
    }
  );

  const handleReset = useEventCallback(() => {
    setQuery("");
  });

  return (
    <RightDrawer {...props} onClose={handleClose}>
      <Box className={classes.dialogCloseArea}>
        {otherCube ? null : (
          <Grow in={!isOpen}>
            <div>
              <IconButton onClick={() => open()}>
                <SvgIcInfoCircle />
              </IconButton>
            </div>
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
            <Box display="flex" alignItems="center" gap="0.5rem" mb="1rem">
              <Input
                key={query}
                id="search"
                inputProps={{ ref: inputRef }}
                defaultValue={query}
                placeholder={t({ id: "dataset.search.placeholder" })}
                autoComplete="off"
                onKeyDown={handleKeyDown}
                endAdornment={
                  query !== "" ? (
                    <ButtonBase data-testid="clearSearch" onClick={handleReset}>
                      <VisuallyHidden>
                        <Trans id="controls.search.clear">
                          Clear search field
                        </Trans>
                      </VisuallyHidden>
                      <Icon name="close" />
                    </ButtonBase>
                  ) : (
                    <ButtonBase data-testid="submitSearch" type="submit">
                      <VisuallyHidden>
                        <Trans id="dataset.search.label">Search</Trans>
                      </VisuallyHidden>
                      <Icon name="search" />
                    </ButtonBase>
                  )
                }
                sx={{ width: "50%" }}
              />
              <Select
                multiple
                value={(selectedSearchDimensions ?? []).map((x) => x.id)}
                onChange={handleChangeSearchDimensions}
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
                        <Tag
                          key={value.id}
                          type="dimension"
                          sx={{ py: 0, mr: 2 }}
                        >
                          {value.label}
                        </Tag>
                      ) : i === 2 ? (
                        <Tag key="more" type="dimension" sx={{ py: 0, mr: 2 }}>
                          <Trans id="dataset.search.search-options.more-2-options-selected">
                            {selected.length - 2} more
                          </Trans>
                        </Tag>
                      ) : null;
                    })
                  )
                }
                sx={{ width: "50%" }}
              >
                {searchDimensionOptions.map((sd) => (
                  <MenuItem
                    key={sd.label}
                    value={sd.id}
                    sx={{
                      gap: 2,
                      backgroundColor: "transparent !important",

                      "&:hover": {
                        backgroundColor: (t) =>
                          `${t.palette.cobalt[50]} !important`,
                      },
                    }}
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
                style={{ minWidth: "fit-content" }}
                onClick={() => {
                  if (inputRef.current) {
                    setQuery(inputRef.current.value);
                  }
                }}
              >
                {t({ id: "dataset.search.label" })}
              </Button>
            </Box>

            <Flex
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <SearchDatasetResultsCount cubes={searchCubes} />
              <Flex sx={{ alignItems: "center", gap: 5 }}>
                <SearchDatasetDraftsControl
                  checked={includeDrafts}
                  onChange={setIncludeDrafts}
                />
                <Divider flexItem orientation="vertical" />
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
                  disableTitleLink: false,
                  showDimensions: true,
                  showTags: true,
                  onClickTitle: (e) => {
                    e.preventDefault();
                    alert("hello");
                    handleClickOtherCube(cube);
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
