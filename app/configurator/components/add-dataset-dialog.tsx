import { Trans, t } from "@lingui/macro";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  dialogActionsClasses,
  dialogClasses,
  dialogContentClasses,
  dialogTitleClasses,
  useEventCallback,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
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
  DataSource,
  addDatasetInConfig,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { Termset, isTemporalDimensionWithTimeUnit } from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  executeDataCubesComponentsQuery,
  useDataCubesComponentsQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import {
  DataCubeComponentsQuery,
  SearchCubeFilterType,
  SearchCubeResultOrder,
  useDataCubeComponentTermsetsQuery,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";
import SvgIcFilter from "@/icons/components/IcFilter";
import SvgIcRemove from "@/icons/components/IcRemove";
import SvgIcSearch from "@/icons/components/IcSearch";
import { useLocale } from "@/locales/use-locale";
import { exhaustiveCheck } from "@/utils/exhaustiveCheck";

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
}));

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

  // TODO Right now, we only support one join by dimension
  return possibleJoinBys;
};

export type JoinBy = ReturnType<typeof inferJoinBy>[0];

export const PreviewDataTable: React.FC<{
  dataSource: DataSource;
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
}> = ({
  otherCube,
  dataSource,
  currentComponents,
  inferredJoinBy,
  otherCubeComponents,
  onClickBack,
  onConfirm,
  fetchingComponents,
}) => {
  const locale = useLocale();
  const isQueryPaused = !otherCubeComponents || !currentComponents;
  const [observations] = useDataCubesObservationsQuery({
    pause: isQueryPaused,
    variables: {
      locale,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      cubeFilters: [
        {
          iri: currentComponents!.dimensions?.[0].cubeIri,
          joinBy: inferredJoinBy.left,
        },
        {
          iri: otherCube.iri,
          joinBy: inferredJoinBy.right,
        },
      ],
    },
  });

  const allColumns = useMemo(() => {
    const currentDimensions = currentComponents?.dimensions ?? [];
    const currentMeasures = currentComponents?.measures ?? [];
    const otherDimensions = otherCubeComponents?.dimensions ?? [];
    const otherMeasures = otherCubeComponents?.measures ?? [];

    const toColumn = (d: any) => ({
      label: d.label,
      iri: d.iri,
      cubeIri: d.cubeIri,
    });

    const joinedColumns = [...currentDimensions, ...otherDimensions].filter(
      (x) => {
        return x.iri === inferredJoinBy.left || x.iri === inferredJoinBy.right;
      }
    );

    const currentColumns = [...currentDimensions, ...currentMeasures].map(
      toColumn
    );

    const otherColumns = [...otherDimensions, ...otherMeasures].map(toColumn);

    return [
      {
        iri: "joinBy",
        cubeIri: "joinBy",
        label: (
          <>
            {joinedColumns
              .map((x) => {
                return x.label;
              })
              .join(" / ")}
          </>
        ),
      },
      ...otherColumns,
      ...currentColumns,
    ];
  }, [
    currentComponents?.dimensions,
    currentComponents?.measures,
    inferredJoinBy.left,
    inferredJoinBy.right,
    otherCubeComponents?.dimensions,
    otherCubeComponents?.measures,
  ]);

  return (
    <>
      <DialogContent sx={{ overflowX: "hidden" }}>
        <Typography variant="h2" mb="1rem">
          <Trans id="dataset.search.preview.title">Preview data table</Trans>
        </Typography>
        <Typography variant="body1" mb="2rem">
          <Trans id="dataset.search.preview.description">
            Review data preview of new available dimensions and continue to edit
            visualization.
          </Trans>
        </Typography>
        {fetchingComponents ? <CircularProgress size={12} /> : null}
        {otherCubeComponents ? (
          <>
            {observations.data?.dataCubesObservations ? (
              <Box
                sx={{
                  width: "100%",
                  overflowX: "scroll",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      {allColumns.map((column) => (
                        <TableCell
                          key={column.iri}
                          sx={{ width: 300, whiteSpace: "nowrap" }}
                        >
                          {column.label}
                          {column.cubeIri === otherCube.iri && (
                            <Tag type="theme" sx={{ ml: 1 }}>
                              New
                            </Tag>
                          )}
                          {column.iri === "joinBy" && (
                            <Tag type="dimension" sx={{ ml: 1 }}>
                              Joined
                            </Tag>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {observations.data.dataCubesObservations.data.map(
                      (observation, index) => (
                        <TableRow key={index}>
                          {allColumns.map((column) => (
                            <TableCell key={column.iri}>
                              {observation[column.iri]}
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </Box>
            ) : null}
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClickBack}>
          <Trans id="button.back">Back</Trans>
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          <Trans id="button.confirm">Confirm</Trans>
        </Button>
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
      filters: [
        selectedTemporalDimension
          ? {
              type: SearchCubeFilterType.TemporalDimension,
              value: selectedTemporalDimension.timeUnit,
            }
          : null,
        selectedSharedDimensions && selectedSharedDimensions.length > 0
          ? {
              type: SearchCubeFilterType.SharedDimensions,
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
    const formdata = Object.fromEntries(
      new FormData(ev.currentTarget).entries()
    );
    setQuery(formdata.search as string);
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
    return inferJoinBy(selectedSearchDimensions ?? [], otherCube)[0];
  }, [otherCube, selectedSearchDimensions]);

  const [otherCubeComponents] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: otherCube ? [{ iri: otherCube.iri }] : [],
    },
    pause: !otherCube,
  });
  const [{ fetching, otherIri }, { addDataset }] = useAddDataset();

  const handleClickOtherCube = (otherCube: PartialSearchCube) => {
    const joinedBy = inferJoinBy(selectedSearchDimensions ?? [], otherCube);
    if (joinedBy.length !== 1) {
      alert(
        "For now, merging cubes only supports one join by dimension. Please select only one dimension to join by."
      );
    } else {
      setOtherCube(otherCube);
    }
  };

  return (
    <Dialog
      {...props}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      className={clsx(classes.dialog, props.className)}
    >
      <DialogCloseButton onClick={(ev) => handleClose(ev, "escapeKeyDown")} />
      {otherCube ? null : (
        <>
          <DialogTitle sx={{ typography: "h2" }}>
            {t({
              id: "chart.datasets.add-dataset-dialog.title",
              message: "Select dataset with shared dimensions",
            })}
          </DialogTitle>
          <DialogContent>
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
                      secondary={
                        sd.type === "temporal" ? (
                          <Tag type="termset">{sd.timeUnit}</Tag>
                        ) : (
                          <>
                            <Typography
                              variant="caption"
                              color="grey.600"
                              mr={2}
                            >
                              <Trans id="dataset-result.dimension-termset-contains" />
                            </Typography>
                            {sd.termsets.map((t) => (
                              <Tag key={t.iri} type="termset">
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
                          loading={fetching && otherIri === cube.iri}
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
          dataSource={state.dataSource}
          currentComponents={currentComponents}
          inferredJoinBy={inferredJoinBy}
          otherCube={otherCube}
          otherCubeComponents={otherCubeComponents?.data?.dataCubesComponents}
          fetchingComponents={!!otherCubeComponents?.fetching}
          onConfirm={async () => {
            if (!currentComponents || !otherCube || !inferredJoinBy) {
              return null;
            }

            await addDataset({
              joinBy: inferredJoinBy,
              otherCube: otherCube,
            });
            handleClose({}, "escapeKeyDown");
          }}
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
