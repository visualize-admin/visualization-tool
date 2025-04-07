import { t, Trans } from "@lingui/macro";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  DrawerProps,
  Grow,
  IconButton,
  IconButtonProps,
  InputAdornment,
  Link,
  ListItemText,
  MenuItem,
  OutlinedInput,
  paperClasses,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  TypographyProps,
  useEventCallback,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import maxBy from "lodash/maxBy";
import uniq from "lodash/uniq";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useClient } from "urql";

import {
  DatasetResults,
  PartialSearchCube,
  SearchDatasetDraftsControl,
  SearchDatasetResultsCount,
  SearchDatasetSortControl,
} from "@/browser/dataset-browse";
import { FirstTenRowsCaption } from "@/browser/dataset-preview";
import { getEnabledChartTypes } from "@/charts";
import Flex from "@/components/flex";
import { Error as ErrorHint, HintOrange, Loading } from "@/components/hint";
import Tag from "@/components/tag";
import { ConfiguratorStateConfiguringChart, DataSource } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { RightDrawer } from "@/configurator/components/drawers";
import {
  addDatasetInConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import {
  Dimension,
  isJoinByComponent,
  isStandardErrorDimension,
  isTemporalDimensionWithTimeUnit,
  Measure,
  Termset,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  executeDataCubesComponentsQuery,
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { joinDimensions } from "@/graphql/join";
import { ComponentId } from "@/graphql/make-component-id";
import {
  DataCubeComponentsQuery,
  DataCubeComponentsQueryVariables,
  SearchCubeFilterType,
  SearchCubeResultOrder,
  useDataCubeComponentsQuery,
  useDataCubeComponentTermsetsQuery,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";
import SvgIcClose from "@/icons/components/IcClose";
import SvgIcFilter from "@/icons/components/IcFilter";
import SvgIcInfoCircle from "@/icons/components/IcInfoCircle";
import SvgIcSearch from "@/icons/components/IcSearch";
import { useLocale } from "@/locales/use-locale";
import { useEventEmitter } from "@/utils/eventEmitter";
import useEvent from "@/utils/use-event";
import useLocalState from "@/utils/use-local-state";

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

const useStyles = makeStyles((theme: Theme) => ({
  addButton: {
    transition: "opacity 0.25s ease",
  },
  dialogCloseArea: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  newAnnotation: {
    color: theme.palette.success.main,
  },
  listTag: {
    whiteSpace: "break-spaces",
  },
  listItemSecondary: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 1,
    paddingTop: theme.spacing(1),
  },
  previewSelect: {
    width: 302,
  },
  previewSelectPaper: {
    [`& .${paperClasses.root}`]: {
      marginTop: "0.25rem",
    },
  },
}));

const NewAnnotation = (props: TypographyProps) => {
  const classes = useStyles();
  return (
    <Typography
      className={clsx(classes.newAnnotation, props.className)}
      lineHeight={1}
      variant="caption"
      {...props}
    >
      <Trans id="dataset.search.preview.new-dimension">New</Trans>
    </Typography>
  );
};

const useCautionAlert = () => {
  const [isOpen, setIsOpen] = useLocalState("add-dataset-caution-alert", true);

  return {
    isOpen,
    open: useCallback(() => setIsOpen(true), [setIsOpen]),
    close: useCallback(() => setIsOpen(false), [setIsOpen]),
  };
};

const CautionAlert = ({ onConfirm }: { onConfirm: () => void }) => {
  return (
    <HintOrange>
      <Trans id="dataset.search.caution.body">
        The linking of different datasets carries risks such as data
        inconsistencies, scalability issues, and unexpected correlations. Be
        sure to use to merge datasets only when you are confident that data
        should be merged together.
      </Trans>
      <Box sx={{ mt: 1 }}>
        <Link
          onClick={(ev) => {
            ev.preventDefault();
            onConfirm();
          }}
          href="#"
        >
          <Trans id="dataset.search.caution.acknowledge">
            Understood, I&apos;ll proceed cautiously.
          </Trans>
        </Link>
      </Box>
    </HintOrange>
  );
};

type SearchOptions =
  | {
      type: "temporal";
      id: ComponentId;
      label: string;
      timeUnit: string;
    }
  | {
      type: "shared";
      /** Technically it's an iri, but we keep the id name for the sake of type consistency. */
      id: string;
      label: string;
      termsets: Termset[];
    };

const inferJoinBy = (
  leftOptions: SearchOptions[],
  rightCube: PartialSearchCube
) => {
  const possibleJoinBys = leftOptions
    .map((leftOption) => {
      const type = leftOption.type;
      // For every selected dimension, we need to find the corresponding dimension on the other cube
      switch (type) {
        case "temporal":
          return {
            left: leftOption.id,
            right: rightCube?.dimensions?.find(
              (d) =>
                // TODO Find out why this is necessary
                d.timeUnit ===
                `http://www.w3.org/2006/time#unit${leftOption.timeUnit}`
            )?.id,
          };
        case "shared":
          return {
            left: leftOption.id,
            right: rightCube?.dimensions?.find((d) =>
              d.termsets.some((t) =>
                leftOption.termsets.map((t) => t.iri).includes(t.iri)
              )
            )?.id,
          };
        default:
          const exhaustiveCheck: never = type;
          return exhaustiveCheck;
      }
    })
    .filter(
      (x): x is { left: ComponentId; right: ComponentId } =>
        !!(x.left && x.right)
    );

  return possibleJoinBys.reduce<{
    left: string[];
    right: string[];
  }>(
    (acc, item) => {
      acc.left.push(item.left);
      acc.right.push(item.right);
      return acc;
    },
    { left: [], right: [] }
  );
};

type JoinBy = ReturnType<typeof inferJoinBy>;

const PreviewDataTable = ({
  existingCubes,
  otherCube,
  dataSource,
  currentComponents,
  inferredJoinBy,
  otherCubeComponents,
  onClickBack,
  onConfirm,
  fetchingComponents,
  addingDataset,
}: {
  dataSource: DataSource;
  existingCubes: { iri: string }[];
  currentComponents:
    | DataCubeComponentsQuery["dataCubeComponents"]
    | undefined
    | null;
  inferredJoinBy: JoinBy;
  otherCube: PartialSearchCube;
  otherCubeComponents:
    | DataCubeComponentsQuery["dataCubeComponents"]
    | undefined
    | null;
  searchDimensionsSelected: SearchOptions[];
  onClickBack: () => void;
  onConfirm: () => void;
  fetchingComponents: boolean;
  addingDataset: boolean;
}) => {
  const locale = useLocale();
  const isQueryPaused = !otherCubeComponents || !currentComponents;

  const cubeFilters = [
    {
      iri: currentComponents!.dimensions?.[0].cubeIri,
      joinBy: inferredJoinBy.left,
    },
    {
      iri: otherCube.iri,
      joinBy: inferredJoinBy.right,
    },
  ];
  const [observations] = useDataCubesObservationsQuery({
    pause: isQueryPaused,
    variables: {
      locale,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      cubeFilters,
    },
  });
  const [currentCubes] = useDataCubesMetadataQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale: locale,
      cubeFilters: existingCubes.map((cube) => ({ iri: cube.iri })),
    },
  });

  const isFetching =
    fetchingComponents || observations.fetching || currentCubes.fetching;

  const allColumns = useMemo(() => {
    const shouldIncludeColumnInPreview = (d: Dimension | Measure) =>
      !isStandardErrorDimension(d);
    const currentDimensions = (currentComponents?.dimensions ?? []).filter(
      (x) => shouldIncludeColumnInPreview(x)
    );
    const currentMeasures = (currentComponents?.measures ?? []).filter((x) =>
      shouldIncludeColumnInPreview(x)
    );
    const otherDimensions = (otherCubeComponents?.dimensions ?? []).filter(
      (x) => shouldIncludeColumnInPreview(x)
    );
    const otherMeasures = (otherCubeComponents?.measures ?? []).filter((x) =>
      shouldIncludeColumnInPreview(x)
    );

    const joinedColumns = joinDimensions([
      {
        dataCubeComponents: {
          dimensions: currentDimensions,
          measures: [],
        },
        joinBy: inferredJoinBy.left,
      },
      {
        dataCubeComponents: {
          dimensions: otherDimensions,
          measures: [],
        },
        joinBy: inferredJoinBy.right,
      },
    ]);

    const {
      join: joinedJoinDimensions = [],
      other: joinedOtherDimensions = [],
      current: joinedCurrentDimensions = [],
    } = groupBy(joinedColumns, (d) => {
      const isJoinBy = isJoinByComponent(d);
      return isJoinBy
        ? "join"
        : d.cubeIri === otherCube.iri
          ? "other"
          : "current";
    });

    return [
      ...joinedJoinDimensions,
      ...joinedOtherDimensions,
      ...otherMeasures,
      ...joinedCurrentDimensions,
      ...currentMeasures,
    ];
  }, [
    currentComponents?.dimensions,
    currentComponents?.measures,
    inferredJoinBy.left,
    inferredJoinBy.right,
    otherCube.iri,
    otherCubeComponents?.dimensions,
    otherCubeComponents?.measures,
  ]);

  const [selectedColumnsRaw, setSelectedColumns] = useState<
    undefined | string[]
  >(undefined);
  useEffect(() => {
    if (
      otherCubeComponents?.dimensions &&
      otherCubeComponents.measures &&
      selectedColumnsRaw === undefined
    ) {
      setSelectedColumns(allColumns.map((x) => x.id));
    }
  }, [
    allColumns,
    otherCubeComponents?.dimensions,
    otherCubeComponents?.measures,
    selectedColumnsRaw,
  ]);
  const selectedColumns = useMemo(
    () => selectedColumnsRaw ?? [],
    [selectedColumnsRaw]
  );

  const selectedColumnsById = useMemo(
    () => Object.fromEntries(selectedColumns.map((x) => [x, true])),
    [selectedColumns]
  );

  const previewObservations = useMemo(() => {
    const data = observations.data?.dataCubesObservations.data ?? [];
    const bestObservation = maxBy(data, (obs) => {
      return allColumns.reduce((acc, dim) => acc + (obs[dim.id] ? 1 : 0), 0);
    });

    const amount = 8;
    const index = bestObservation ? data.indexOf(bestObservation) : 0;
    const clampedIndex = Math.max(0, Math.min(index, data.length - amount));
    return data.slice(clampedIndex, clampedIndex + amount);
  }, [allColumns, observations.data?.dataCubesObservations.data]);

  return (
    <>
      <DialogContent sx={{ overflowX: "hidden" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Typography variant="h2">
            <Trans id="dataset.search.preview.title">
              Review available dimensions
            </Trans>
          </Typography>
          <Typography variant="body1">
            <Trans id="dataset.search.preview.description">
              Review all available dimensions before continuing to edit your
              visualization.
            </Trans>
          </Typography>
          <div>
            <Typography variant="h6" mb={1}>
              <Trans id="dataset.search.preview.datasets">Datasets</Trans>
            </Typography>
            <Stack direction="column" spacing={1}>
              <Typography variant="caption">
                {currentCubes.data?.dataCubesMetadata
                  .map((metadata) => metadata.title)
                  .join(", ")}
              </Typography>
              <div>
                <NewAnnotation />
                <br />
                <Typography variant="caption" mt={-1} component="div">
                  {otherCube.title}
                </Typography>
              </div>
            </Stack>
          </div>
          {isFetching ? <Loading delayMs={0} /> : null}
          {observations.error ? (
            <ErrorHint>
              <Box
                component="details"
                sx={{ width: "100%", cursor: "pointer" }}
              >
                <summary>{observations.error.name}</summary>
                {observations.error.message}
              </Box>
            </ErrorHint>
          ) : null}
        </Box>
        {otherCubeComponents ? (
          <>
            {observations.data?.dataCubesObservations ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    overflowX: "scroll",
                    width: "100%",
                    mt: 6,
                    mb: 4,
                    boxShadow: 4,
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        {allColumns.map((column) =>
                          !!selectedColumnsById[column.id] ? (
                            <TableCell
                              key={column.id}
                              sx={{ minWidth: 200, maxWidth: 300 }}
                            >
                              {column.cubeIri === otherCube.iri && (
                                <NewAnnotation />
                              )}
                              {isJoinByComponent(column) ? (
                                <>
                                  <Tooltip
                                    arrow
                                    title={
                                      <>
                                        {column.originalIds
                                          .map((o) => o.description)
                                          .join(", ")}
                                      </>
                                    }
                                    placement="right"
                                  >
                                    <Tag type="dimension">Joined</Tag>
                                  </Tooltip>
                                </>
                              ) : null}
                              <br />
                              <Typography variant="h5">
                                {column.label}
                              </Typography>
                            </TableCell>
                          ) : null
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewObservations.map((observation, index) => (
                        <TableRow key={index}>
                          {allColumns.map((column) =>
                            !!selectedColumnsById[column.id] ? (
                              <TableCell key={column.id}>
                                {observation[column.id]}
                              </TableCell>
                            ) : null
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
                <FirstTenRowsCaption />
              </Box>
            ) : null}
          </>
        ) : null}
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
          px: 4,
          pt: "0 !important",
          pb: "2rem !important",
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={onClickBack}>
            <Trans id="button.back">Back</Trans>
          </Button>
          <LoadingButton
            loading={addingDataset}
            variant="contained"
            onClick={onConfirm}
          >
            <Trans id="button.confirm">Confirm</Trans>
          </LoadingButton>
        </Box>
      </DialogActions>
    </>
  );
};

export const AddDatasetDrawer = ({
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

  const currentCubes = activeChartConfig.cubes.slice(0, 1);

  // Getting cube dimensions, to find temporal dimensions
  const [cubesComponentQuery] = useDataCubesComponentsQuery({
    pause: !props.open,
    variables: {
      ...commonQueryVariables,
      cubeFilters: currentCubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
      })),
    },
  });

  // Getting cube termsets, to then search for cubes with at least one matching termset
  const [cubeComponentTermsets] = useDataCubeComponentTermsetsQuery({
    pause: !props.open,
    variables: {
      locale,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      cubeFilter: {
        iri: currentCubes[0].iri,
      },
    },
  });

  const searchDimensionOptions: SearchOptions[] = useMemo(() => {
    const temporalDimensions =
      cubesComponentQuery.data?.dataCubesComponents.dimensions.filter(
        isTemporalDimensionWithTimeUnit
      ) ?? [];
    const sharedDimensions =
      cubeComponentTermsets.data?.dataCubeComponentTermsets ?? [];
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
  }, [
    cubeComponentTermsets.data?.dataCubeComponentTermsets,
    cubesComponentQuery.data?.dataCubesComponents.dimensions,
  ]);

  const searchDimensionOptionsById = keyBy(searchDimensionOptions, (x) => x.id);

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

  const selectedSharedDimensions = selectedSearchDimensions?.filter(
    (x): x is Extract<(typeof searchDimensionOptions)[0], { type: "shared" }> =>
      x.type === "shared"
  );

  const selectedTemporalDimension = (selectedSearchDimensions ?? []).find(
    (
      x
    ): x is Extract<(typeof searchDimensionOptions)[0], { type: "temporal" }> =>
      x.type === "temporal"
  );

  const isSearchQueryPaused =
    !cubesComponentQuery.data || !selectedSearchDimensions?.length;
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

  const currentComponents = cubesComponentQuery.data?.dataCubesComponents;

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

  useEffect(() => {
    if (
      selectedSearchDimensions === undefined &&
      cubeComponentTermsets.data &&
      cubesComponentQuery.data
    ) {
      setSelectedSearchDimensions(searchDimensionOptions);
    }
  }, [
    cubeComponentTermsets,
    cubesComponentQuery.data,
    searchDimensionOptions,
    selectedSearchDimensions,
  ]);

  const [otherCube, setOtherCube] = useState<PartialSearchCube>();
  const inferredJoinBy = useMemo(() => {
    if (!otherCube) {
      return undefined;
    }
    return inferJoinBy(selectedSearchDimensions ?? [], otherCube);
  }, [otherCube, selectedSearchDimensions]);

  const [otherCubeComponentsQuery] = useDataCubeComponentsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilter: { iri: otherCube ? otherCube.iri : "" },
    },
    pause: !otherCube,
  });
  // We need to check for this otherwise otherCubeComponents will hold the previous data, even if
  // we change otherCube
  const otherCubeQueryCubeIri = (
    otherCubeComponentsQuery?.operation
      ?.variables as DataCubeComponentsQueryVariables
  )?.cubeFilter.iri;
  const otherCubeComponents =
    otherCubeQueryCubeIri === otherCube?.iri
      ? otherCubeComponentsQuery.data?.dataCubeComponents
      : undefined;

  const [{ fetching: addingDataset }, { addDataset }] = useAddDataset();

  const handleClickOtherCube = (otherCube: PartialSearchCube) => {
    setOtherCube(otherCube);
  };

  const { isOpen, open, close } = useCautionAlert();

  const ee = useEventEmitter();
  const handleConfirm = useEventCallback(async () => {
    if (!currentComponents || !otherCube || !inferredJoinBy) {
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
                  cubeComponentTermsets.fetching ||
                  cubesComponentQuery.fetching ? (
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
                fetching={
                  searchQuery.fetching ||
                  cubeComponentTermsets.fetching ||
                  cubesComponentQuery.fetching
                }
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
          currentComponents={currentComponents}
          inferredJoinBy={inferredJoinBy}
          existingCubes={currentCubes}
          otherCube={otherCube}
          otherCubeComponents={otherCubeComponents}
          fetchingComponents={!!otherCubeComponentsQuery?.fetching}
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
