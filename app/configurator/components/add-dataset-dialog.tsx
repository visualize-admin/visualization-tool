import { t, Trans } from "@lingui/macro";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  AlertProps,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  dialogActionsClasses,
  dialogClasses,
  DialogContent,
  dialogContentClasses,
  DialogProps,
  DialogTitle,
  dialogTitleClasses,
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

import { DatasetResults, PartialSearchCube } from "@/browser/dataset-browse";
import { FirstTenRowsCaption } from "@/browser/dataset-preview";
import { getPossibleChartTypes } from "@/charts";
import { Error as ErrorHint, Loading } from "@/components/hint";
import Tag from "@/components/tag";
import {
  addDatasetInConfig,
  ConfiguratorStateConfiguringChart,
  DataSource,
  getChartConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { BetaTag } from "@/configurator/components/beta-tag";
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
import {
  DataCubeComponentsQuery,
  DataCubeComponentsQueryVariables,
  SearchCubeFilterType,
  SearchCubeResultOrder,
  useDataCubeComponentsQuery,
  useDataCubeComponentTermsetsQuery,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";
import SvgIcFilter from "@/icons/components/IcFilter";
import SvgIcInfo from "@/icons/components/IcInfo";
import SvgIcRemove from "@/icons/components/IcRemove";
import SvgIcSearch from "@/icons/components/IcSearch";
import { useLocale } from "@/locales/use-locale";
import { useEventEmitter } from "@/utils/eventEmitter";
import { exhaustiveCheck } from "@/utils/exhaustiveCheck";
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
      <SvgIcRemove width={24} height={24} fontSize={24} />
    </IconButton>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  addButton: {
    transition: "opacity 0.25s ease",
  },
  dialog: {
    "--dialog-padding": "60px",
    [`& .${dialogTitleClasses.root}`]: {
      padding: "var(--dialog-padding)",
      paddingBottom: 0,
    },
    [`& .${dialogContentClasses.root}`]: {
      padding: "var(--dialog-padding)",
      paddingTop: "2rem",
    },
    [`& .${dialogActionsClasses.root}`]: {
      padding: "var(--dialog-padding)",
      paddingTop: 0,
    },
    [`& .${dialogClasses.paper}`]: {
      minHeight: "calc(100vh - calc(30px * 2))",
    },
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

const CautionAlert = ({
  onConfirm,
  ...props
}: { onConfirm: () => void } & AlertProps) => {
  return (
    <Alert
      {...props}
      icon={<SvgIcInfo />}
      severity="info"
      sx={{ ...props.sx, typography: "body3", color: "text.primary" }}
    >
      <Trans id="dataset.search.caution.body">
        The linking of different datasets carries risks such as data
        inconsistencies, scalability issues, and unexpected correlations. Be
        sure to use to merge datasets only when you are confident that data
        should be merged together.
      </Trans>
      <Box sx={{ mt: 1 }}>
        <Link
          color="primary"
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
    </Alert>
  );
};

export type SearchOptions =
  | {
      type: "temporal";
      iri: string;
      label: string;
      timeUnit: string;
    }
  | {
      type: "shared";
      iri: string;
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
            left: leftOption.iri,
            right: rightCube?.dimensions?.find(
              (d) =>
                // TODO Find out why this is necessary
                d.timeUnit ===
                `http://www.w3.org/2006/time#unit${leftOption.timeUnit}`
            )?.iri,
          };
        case "shared":
          return {
            left: leftOption.iri,
            right: rightCube?.dimensions?.find((d) =>
              d.termsets.some((t) =>
                leftOption.termsets.map((t) => t.iri).includes(t.iri)
              )
            )?.iri,
          };
        default:
          return exhaustiveCheck(
            type,
            `Unknown search cube join by dimension ${type}`
          );
      }
    })
    .filter((x): x is { left: string; right: string } => !!(x.left && x.right));

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

export type JoinBy = ReturnType<typeof inferJoinBy>;

/** Makes a unique identifier for a column */
const columnId = (col: { iri: string; cubeIri: string }) =>
  `${col.cubeIri}/${col.iri}`;

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
      setSelectedColumns(allColumns.map((x) => columnId(x)));
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

  const selectedColumnsByIri = useMemo(
    () => Object.fromEntries(selectedColumns.map((x) => [x, true])),
    [selectedColumns]
  );

  const previewObservations = useMemo(() => {
    const data = observations.data?.dataCubesObservations.data ?? [];
    const bestObservation = maxBy(data, (obs) => {
      return allColumns.reduce((acc, dim) => acc + (obs[dim.iri] ? 1 : 0), 0);
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
                {currentCubes.data?.dataCubesMetadata[0].title}
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
              <Box component="details" sx={{ width: "100%" }}>
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
                <Box sx={{ overflowX: "scroll", width: "100%", mt: 6 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {allColumns.map((column) =>
                          !!selectedColumnsByIri[columnId(column)] ? (
                            <TableCell
                              key={column.iri}
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
                                        {column.originalIris
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
                            !!selectedColumnsByIri[columnId(column)] ? (
                              <TableCell key={column.iri}>
                                {observation[column.iri]}
                              </TableCell>
                            ) : null
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
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
        <FirstTenRowsCaption />
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

  // Getting cube termsets, to then search for cubes with at least one matching termset
  const [cubeComponentTermsets] = useDataCubeComponentTermsetsQuery({
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

  const searchDimensionOptions: SearchOptions[] = useMemo(() => {
    const temporalDimensions =
      cubesComponentQuery.data?.dataCubesComponents.dimensions.filter(
        isTemporalDimensionWithTimeUnit
      ) ?? [];
    const sharedDimensions =
      cubeComponentTermsets.data?.dataCubeComponentTermsets ?? [];
    return [
      ...temporalDimensions.map((x) => {
        return {
          type: "temporal" as const,
          iri: x.iri,
          label: x.label,
          timeUnit: x.timeUnit,
        };
      }),
      ...sharedDimensions.map((x) => {
        return {
          type: "shared" as const,
          iri: x.iri,
          label: x.label,
          termsets: x.termsets,
        };
      }),
    ];
  }, [
    cubeComponentTermsets.data?.dataCubeComponentTermsets,
    cubesComponentQuery.data?.dataCubesComponents.dimensions,
  ]);

  const searchDimensionOptionsByIri = keyBy(
    searchDimensionOptions,
    (x) => x.iri
  );

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
          return searchDimensionOptionsByIri[x];
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
      query: query,
      order: SearchCubeResultOrder.Score,
      includeDrafts: false,
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

  const currentComponents = cubesComponentQuery.data?.dataCubesComponents;

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const formData = Object.fromEntries(
      new FormData(ev.currentTarget).entries()
    );
    setQuery(formData.search as string);
  };

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

  const searchCubes = useMemo(() => {
    const relevantCubeIris = relevantCubes.map((d) => d.iri);
    return (
      searchQuery.data?.searchCubes.filter(
        (d) => !relevantCubeIris.includes(d.cube.iri)
      ) ?? []
    );
  }, [relevantCubes, searchQuery.data?.searchCubes]);

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
    <Dialog
      {...props}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      className={clsx(classes.dialog, props.className)}
    >
      <Box className={classes.dialogCloseArea}>
        {otherCube ? null : (
          <Grow in={!isOpen}>
            <IconButton color="primary" onClick={() => open()}>
              <SvgIcInfo />
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
            <BetaTag
              tagProps={{
                sx: { ml: 2, position: "relative", top: "-1rem" },
              }}
            />
          </DialogTitle>
          <DialogContent>
            <Collapse in={isOpen}>
              <CautionAlert sx={{ mb: 4 }} onConfirm={() => close()} />
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
                value={(selectedSearchDimensions ?? []).map((x) => x.iri)}
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
                    notched={false}
                    startAdornment={
                      <InputAdornment position="start" sx={{ mr: 0 }}>
                        <SvgIcFilter />
                      </InputAdornment>
                    }
                    id="select-multiple-chip"
                    label="Chip"
                  />
                }
                sx={{ minWidth: 300 }}
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
                    selected.map((iri, i) => {
                      const value = searchDimensionOptionsByIri[iri];
                      return i < 2 ? (
                        <Tag key={value.iri} type="dimension" sx={{ mr: 1 }}>
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
                    value={sd.iri}
                    sx={{ gap: 2, alignItems: "start" }}
                  >
                    <Checkbox
                      checked={
                        selectedSearchDimensions &&
                        !!selectedSearchDimensions.find((x) => x.iri === sd.iri)
                      }
                    />
                    <ListItemText
                      primary={<Tag type="dimension">{sd.label}</Tag>}
                      classes={{ secondary: classes.listItemSecondary }}
                      secondary={
                        sd.type === "temporal" ? (
                          <Tag type="termset">{sd.timeUnit}</Tag>
                        ) : (
                          <>
                            <Typography
                              variant="caption"
                              color="grey.600"
                              mr={2}
                              gutterBottom
                              component="div"
                            >
                              <Trans id="dataset-result.dimension-termset-contains" />
                            </Typography>
                            {sd.termsets.map((t) => (
                              <Tag
                                key={t.iri}
                                type="termset"
                                className={classes.listTag}
                              >
                                {t.label}
                              </Tag>
                            ))}
                          </>
                        )
                      }
                    />
                  </MenuItem>
                ))}
              </Select>
              <Button color="primary" type="submit" variant="contained">
                {t({ id: "dataset.search.label" })}
              </Button>
            </Box>

            {selectedSearchDimensions?.length === 0 ? (
              <Typography variant="body1">
                <Trans id="dataset.search.at-least-one-compatible-dimension-selected">
                  At least one compatible dimension must be selected.
                </Trans>
              </Typography>
            ) : (
              <DatasetResults
                cubes={searchCubes ?? []}
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
                          size="small"
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
          existingCubes={relevantCubes}
          otherCube={otherCube}
          otherCubeComponents={otherCubeComponents}
          fetchingComponents={!!otherCubeComponentsQuery?.fetching}
          addingDataset={addingDataset}
          onConfirm={handleConfirm}
          onClickBack={() => setOtherCube(undefined)}
          searchDimensionsSelected={selectedSearchDimensions ?? []}
        />
      ) : null}
    </Dialog>
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
            componentIris: undefined,
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
          cubeCount: chartConfig.cubes.length,
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
