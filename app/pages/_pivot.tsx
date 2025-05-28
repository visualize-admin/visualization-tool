import {
  Box,
  Card as MUICard,
  CircularProgress,
  FormControlLabel,
  lighten,
  Switch,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles, styled } from "@mui/styles";
import clsx from "clsx";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Inspector } from "react-inspector";
import { Column, useExpanded, useSortBy, useTable } from "react-table";

import { Loading } from "@/components/hint";
import { ChartConfig } from "@/config-types";
import { Dimension, HierarchyValue, Measure } from "@/domain/data";
import {
  useDataCubesComponentsQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { ComponentId } from "@/graphql/make-component-id";
import { visitHierarchy } from "@/rdf/tree-utils";
import { useEvent } from "@/utils/use-event";

const Card = styled(MUICard)({
  border: "1px solid #ccc",
  backgroundColor: "#eee",
  padding: "1rem",
  marginTop: 16,
  marginBottom: 16,
});

const intDatasource = {
  sourceUrl: "https://lindas-cached.int.cluster.ldbar.ch/query",
  sourceType: "sparql",
};

type Dataset = {
  label: string;
  iri: string;
  datasource: typeof intDatasource;
};

const datasets: Record<string, Dataset> = mapValues(
  {
    "https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/8": {
      label: "ausgaben",
      datasource: intDatasource,
    },
    "https://environment.ld.admin.ch/foen/ubd000502_sad_01/7": {
      label: "Gas",
      datasource: intDatasource,
    },
  },
  (v, k) => ({ ...v, iri: k })
);

type Observation = Record<string, any>;
type PivottedObservation = Record<string, any>;

const useStyles = makeStyles((theme: Theme) => ({
  pivotTableRoot: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gridTemplateAreas: `
"options chart"
    `,
    gridGap: "1rem",
  },
  pivotTableOptions: {
    paddingTop: "1rem",
    gridArea: "options",
  },
  pivotTableChart: {
    gridArea: "chart",
    overflowX: "hidden",
  },
  pivotTableContainer: {
    overflowX: "scroll",
  },
  pivotTableTable: {
    width: "100%",
    fontSize: "12px",
    borderCollapse: "collapse",
    "& td, & th": {
      border: "1px solid #ccc",
      whiteSpace: "nowrap",
      padding: "4px",
    },
  },
  optionGroup: {
    "& + &": {
      marginTop: "0.75rem",
    },
  },
  row: {
    transition: "background-color 0.3s ease",
  },
  expanded: {},
  depth_0: {
    "&$expanded": {
      background: lighten(theme.palette.primary.light, 0.75),
    },
  },
  depth_1: {
    "&$expanded": {
      background: lighten(theme.palette.primary.light, 0.5),
    },
  },
  depth_2: {
    "&$expanded": {
      background: lighten(theme.palette.primary.light, 0.15),
    },
  },
}));

const indexHierarchy = (hierarchy: HierarchyValue[]) => {
  const byLabel = new Map<string, HierarchyValue>();
  const parentsByIri = new Map<string, HierarchyValue>();
  const childrenByIri = new Map<string, HierarchyValue[]>();
  const byIri = new Map<string, HierarchyValue>();
  visitHierarchy(hierarchy, (x_) => {
    const x = x_ as HierarchyValue;
    byLabel.set(x.label, x);
    byIri.set(x.value, x);

    const children = x.children as HierarchyValue[];
    if (children) {
      childrenByIri.set(x.value, children);
      for (let child of children) {
        parentsByIri.set(child.value, x);
      }
    }
  });
  return { byLabel, parentsByIri, childrenByIri, byIri };
};

const useBarStyles = makeStyles<Theme>((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
  },
}));

const Bar = ({ percent }: { percent: number }) => {
  const classes = useBarStyles();
  return (
    <div
      className={classes.root}
      style={{ height: 4, width: (100 * percent) / 100 }}
    ></div>
  );
};

const PivotTable = ({ dataset }: { dataset: (typeof datasets)[string] }) => {
  const [activeMeasures, setActiveMeasures] = useState<
    Record<Measure["id"], boolean>
  >({});
  const [pivotDimension, setPivotDimension] = useState<Dimension>();
  const [hierarchyDimension, setHierarchyDimension] = useState<Dimension>();
  const [ignoredDimensions, setIgnoredDimensions] = useState<
    Record<Dimension["id"], boolean>
  >({});

  const [{ data: componentsData, fetching: fetchingComponents }] =
    useDataCubesComponentsQuery({
      chartConfig: {
        conversionUnitsByComponentId: {},
      } as ChartConfig,
      variables: {
        ...intDatasource,
        locale: "en",
        cubeFilters: [{ iri: dataset.iri }],
      },
    });
  const [{ data: observationsData, fetching: fetchingObservations }] =
    useDataCubesObservationsQuery({
      chartConfig: {
        conversionUnitsByComponentId: {},
      } as ChartConfig,
      variables: {
        ...intDatasource,
        locale: "en",
        cubeFilters: [{ iri: dataset.iri }],
      },
    });

  const classes = useStyles();

  const allDimensions = componentsData?.dataCubesComponents?.dimensions;
  const dimensions = useMemo(() => {
    return allDimensions?.filter((d) => !ignoredDimensions[d.id]);
  }, [allDimensions, ignoredDimensions]);
  const measures = componentsData?.dataCubesComponents?.measures;
  const observations = useMemo(() => {
    return observationsData?.dataCubesObservations?.data ?? [];
  }, [observationsData?.dataCubesObservations?.data]);

  const handleChangePivot = (ev: ChangeEvent<HTMLSelectElement>) => {
    const name = ev.currentTarget.value;
    setPivotDimension(dimensions?.find((d) => d.id === name));
  };

  const handleChangeHierarchy = (ev: ChangeEvent<HTMLSelectElement>) => {
    const name = ev.currentTarget.value;
    setHierarchyDimension(dimensions?.find((d) => d.id === name));
  };

  const handleToggleMeasure = useEvent((ev: ChangeEvent<HTMLInputElement>) => {
    const measureId = ev.currentTarget.getAttribute("name") as Measure["id"];

    if (!measureId) {
      return;
    }
    setActiveMeasures((am) =>
      am ? { ...am, [measureId]: !am[measureId] } : {}
    );
  });

  const handleToggleIgnoredDimension = useEvent(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const dimensionIri = ev.currentTarget.getAttribute("name") as
        | ComponentId
        | undefined;

      if (!dimensionIri) {
        return;
      }

      setIgnoredDimensions((ignored) =>
        ignored ? { ...ignored, [dimensionIri]: !ignored[dimensionIri] } : {}
      );
    }
  );

  const hierarchy = componentsData?.dataCubesComponents.dimensions.find(
    (d) => d.id === hierarchyDimension?.id
  )?.hierarchy;

  const hierarchyIndexes = useMemo(() => {
    if (hierarchy) {
      return indexHierarchy(hierarchy);
    }
  }, [hierarchy]);

  const { pivotted, pivotUniqueValues, tree } = useMemo(() => {
    if (!pivotDimension || !dimensions || !measures) {
      return {
        pivotted: [],
        pivotUniqueValues: [],
      };
    } else {
      const restDimensions =
        dimensions.filter((f) => f !== pivotDimension) || [];
      const rowKey = (row: Observation) => {
        return restDimensions.map((d) => row[d.id]).join("/");
      };
      const pivotGroups = Object.values(
        groupBy(observations, (x) =>
          restDimensions?.map((d) => x[d.id]).join("/")
        )
      );
      const pivotUniqueValues = new Set<Observation[string]>();
      const rowIndex = new Map<string, { subRows?: PivottedObservation[] }>();

      // Create pivotted rows with pivot dimension values as columns
      const pivotted: PivottedObservation[] = [];
      pivotGroups.forEach((g) => {
        // Start from values that are the same within the group
        const row = Object.fromEntries(
          restDimensions.map((d) => [d.id, g[0][d.id]])
        );

        // Add pivoted dimensions
        for (let item of g) {
          const pivotValueAttr = `${pivotDimension.id}/${
            item[pivotDimension.id]
          }`;
          // @ts-ignore
          row[pivotValueAttr] = Object.fromEntries(
            measures.map((m) => [m.id, item[m.id]])
          );
          pivotUniqueValues.add(item[pivotDimension.id]);
        }
        rowIndex.set(rowKey(row), row);
        pivotted.push(row);
      });

      // Regroup rows with their parent row
      const tree: PivottedObservation[] = [];
      pivotted.forEach((row) => {
        if (hierarchyDimension && hierarchyIndexes) {
          const hierarchyLabel = row[hierarchyDimension.id];
          const hierarchyNode = hierarchyIndexes.byLabel.get(hierarchyLabel);
          const parentNode = hierarchyIndexes.parentsByIri.get(
            hierarchyNode?.value!
          );
          const parentKey = rowKey({
            ...row,
            [hierarchyDimension.id]: parentNode?.label,
          });
          const parentRow = rowIndex.get(parentKey);
          if (parentRow) {
            parentRow.subRows = parentRow.subRows || [];
            parentRow.subRows.push(row);
          } else {
            tree.push(row);
          }

          return;
        }

        tree.push(row);
      });
      return {
        pivotted,
        tree,
        pivotUniqueValues: Array.from(pivotUniqueValues).sort(),
      } as const;
    }
  }, [
    pivotDimension,
    dimensions,
    measures,
    observations,
    hierarchyDimension,
    hierarchyIndexes,
  ]);

  const columns = useMemo((): Column<Observation>[] => {
    if (!dimensions || !measures) {
      return [];
    } else if (pivotDimension) {
      const dimensionColumns: Column<Observation>[] = dimensions
        .filter((d) => d.id !== pivotDimension.id)
        .sort((a) => {
          if (a.id === hierarchyDimension?.id) {
            return 1;
          } else {
            return 0;
          }
        })
        .map((d) => ({
          id: d.id,
          accessor: (x: Observation) => x[d.id],
          Header: d.label,
        }));

      const pivotColumns: Column<Observation>[] = pivotUniqueValues.map(
        (uv) => ({
          Header: uv,
          columns: measures
            .filter((m) => activeMeasures?.[m.id] !== false)
            .map((m) => {
              const showBars = m.label.includes("%");
              return {
                Header: m.label,
                Cell: ({ cell }) => {
                  return (
                    <>
                      {cell.value}
                      {showBars ? (
                        <Bar percent={parseFloat(cell.value)} />
                      ) : null}
                    </>
                  );
                },
                id: `${pivotDimension.id}/${uv}/${m.id}`,
                accessor: (x) => {
                  return x[`${pivotDimension.id}/${uv}`]?.[m.id] || "";
                },
              };
            }),
        })
      );

      const dimensionAndHierarchyColumns = dimensionColumns.map((d) => {
        if (d.id === hierarchyDimension?.id) {
          const col: Column<Observation> = {
            ...d,
            Cell: ({ cell, row }) => {
              const style = {
                // We can even use the row.depth property
                // and paddingLeft to indicate the depth
                // of the row
                paddingLeft: `${row.depth * 1}rem`,
              };
              return (
                // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                // to build the toggle for expanding a row
                <span
                  {...(row.canExpand
                    ? row.getToggleRowExpandedProps({
                        style,
                      })
                    : {
                        style,
                      })}
                >
                  {row.canExpand ? (row.isExpanded ? "▼  " : "▶  ") : null}
                  {cell.value}
                </span>
              );
            },
          };
          return col;
        } else {
          return d;
        }
      });

      return [...dimensionAndHierarchyColumns, ...pivotColumns];
    } else {
      const all = [...dimensions, ...measures];
      return all.map((d) => {
        return {
          accessor: (x) => x[d.id],
          Header: d.label,
        };
      });
    }
  }, [
    dimensions,
    measures,
    pivotDimension,
    pivotUniqueValues,
    hierarchyDimension?.id,
    activeMeasures,
  ]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    expandedDepth,
  } = useTable(
    {
      columns: columns,
      data: pivotDimension && tree ? tree : observations,
    },
    useSortBy,
    useExpanded
  );

  useEffect(() => {
    if (!Object.keys(activeMeasures).length && measures) {
      setActiveMeasures(Object.fromEntries(measures.map((m) => [m.id, true])));
    }
  }, [activeMeasures, measures]);

  return (
    <Box className={classes.pivotTableRoot}>
      <div className={classes.pivotTableOptions}>
        <div className={classes.optionGroup}>
          <Typography variant="h6" gutterBottom display="block">
            Pivot columns
          </Typography>
          <select
            onChange={handleChangePivot}
            value={pivotDimension?.id || "-"}
          >
            <option value="-">-</option>
            {dimensions?.map((d) => {
              return (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              );
            })}
          </select>
        </div>
        <div className={classes.optionGroup}>
          <Typography variant="h6" gutterBottom display="block">
            Group rows by
          </Typography>
          <select
            onChange={handleChangeHierarchy}
            value={hierarchyDimension?.id || "-"}
          >
            <option value="-">-</option>
            {dimensions?.map((d) => {
              return (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              );
            })}
          </select>

          {fetchingComponents ? (
            <CircularProgress size={12} sx={{ ml: 2 }} />
          ) : null}
        </div>
        <div className={classes.optionGroup}>
          <Typography variant="h6" gutterBottom display="block">
            Measures
          </Typography>
          {measures?.map((m) => {
            return (
              <FormControlLabel
                key={m.id}
                label={m.label}
                componentsProps={{ typography: { variant: "caption" } }}
                control={
                  <Switch
                    size="small"
                    checked={activeMeasures?.[m.id]}
                    onChange={handleToggleMeasure}
                    name={m.id}
                  />
                }
              />
            );
          })}
        </div>
        <div className={classes.optionGroup}>
          <Typography variant="h6" display="block">
            Ignored dimensions
          </Typography>
          <Typography variant="caption" gutterBottom display="block">
            If some dimensions contain duplicate information with another
            dimension, it is necessary to ignore them for the grouping to work.
            <br />
            Ex: the Hierarchy column of the Gas dataset is a duplicate of the
            Source of emission column, it needs to be ignored.
          </Typography>
          {allDimensions?.map((d) => {
            return (
              <FormControlLabel
                key={d.id}
                label={d.label}
                componentsProps={{ typography: { variant: "caption" } }}
                control={
                  <Switch
                    size="small"
                    checked={ignoredDimensions?.[d.id]}
                    onChange={handleToggleIgnoredDimension}
                    name={d.id}
                  />
                }
              />
            );
          })}
        </div>
      </div>
      <div className={classes.pivotTableChart}>
        <Card elevation={0}>
          <details>
            <summary>
              <Typography variant="h6" display="inline">
                Debug
              </Typography>
            </summary>

            <Typography variant="overline" display="block">
              Columns
            </Typography>
            <Inspector data={columns} table={false} />
            <Typography variant="overline" display="block">
              Pivoted
            </Typography>
            <Inspector data={pivotted} table={false} />
            <Typography variant="overline" display="block">
              Pivoted tree
            </Typography>
            <Inspector data={tree} table={false} />
            <Typography variant="overline" display="block">
              Hierarchy
            </Typography>
            <Inspector data={hierarchy} table={false} />
            <Typography variant="overline" display="block">
              Hierarchy indexes
            </Typography>
            <Inspector data={hierarchyIndexes} table={false} />
          </details>
        </Card>
        {fetchingComponents || fetchingObservations ? <Loading /> : null}
        <div className={classes.pivotTableContainer}>
          <table {...getTableProps()} className={classes.pivotTableTable}>
            <thead>
              {headerGroups.map((headerGroup) => (
                // eslint-disable-next-line react/jsx-key
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    // eslint-disable-next-line react/jsx-key
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  // eslint-disable-next-line react/jsx-key
                  <tr
                    {...row.getRowProps()}
                    className={clsx(
                      classes.row,
                      row.isExpanded ? classes.expanded : null,
                      classes[
                        `depth_${
                          expandedDepth - row.depth
                        }` as keyof typeof classes
                      ]
                    )}
                  >
                    {row.cells.map((cell) => {
                      return (
                        // eslint-disable-next-line react/jsx-key
                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Box>
  );
};

const Page = () => {
  const [dataset, setDataset] = useState(
    datasets[Object.keys(datasets)[0] as keyof typeof datasets]!
  );

  const handleChangeDataset = (ev: ChangeEvent<HTMLSelectElement>) => {
    const name = ev.currentTarget.value;
    if (name in datasets) {
      setDataset(datasets[name as keyof typeof datasets]);
    }
  };

  return (
    <Box m={5}>
      <Typography variant="h2">Pivot table</Typography>
      <Typography variant="overline" display="block">
        Dataset
      </Typography>

      <select onChange={handleChangeDataset} value={dataset.iri}>
        {Object.keys(datasets).map((k) => {
          const dataset = datasets[k as keyof typeof datasets];
          return (
            <option key={dataset.iri} value={dataset.iri}>
              {dataset.label}
            </option>
          );
        })}
      </select>
      <PivotTable key={dataset.iri} dataset={dataset} />
    </Box>
  );
};

export default Page;
