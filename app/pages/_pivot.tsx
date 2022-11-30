import {
  Typography,
  FormControlLabel,
  Switch,
  Box,
  Card as MUICard,
} from "@mui/material";
import { makeStyles, styled } from "@mui/styles";
import React, { ChangeEvent, useMemo, useState } from "react";
import { Column, useTable } from "react-table";

import { Loading } from "@/components/hint";
import {
  Dimension,
  Measure,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";

import mapValues from "lodash/mapValues";
import Inspector from "react-inspector";
import groupBy from "lodash/groupBy";
import { useEffect } from "react";
import useEvent from "@/utils/use-event";

const Card = styled(MUICard)({
  border: "1px solid #ccc",
  backgroundColor: "#eee",
  borderRadius: "1rem",
  padding: "1rem",
  marginTop: 16,
  marginBottom: 16,
});

const intDatasource = {
  sourceUrl: "https://int.lindas.admin.ch/query",
  sourceType: "sparql",
};
const datasets = mapValues(
  {
    "https://environment.ld.admin.ch/foen/ubd000502_sad_01/7": {
      label: "Gas",
      datasource: intDatasource,
    },
    "https://environment.ld.admin.ch/foen/fab_Offentliche_Ausgaben_test3/8": {
      label: "ausgaben",
      datasource: intDatasource,
    },
  },
  (v, k) => ({ ...v, iri: k })
);

type Observation = Record<string, any>;

const useStyles = makeStyles(() => ({
  table: {
    fontSize: "12px",
    borderCollapse: "collapse",
    "& td, & th": {
      border: "1px solid #ccc",
      whiteSpace: "nowrap",
      padding: 4,
    },
  },
}));

const Page = () => {
  const [dataset, setDataset] = useState(
    datasets[Object.keys(datasets)[0] as keyof typeof datasets]!
  );
  const [activeMeasures, setActiveMeasures] =
    useState<Record<Measure["iri"], boolean>>();
  const [pivot, setPivot] = useState<Dimension>();

  const handleChangeDataset = (ev: ChangeEvent<HTMLSelectElement>) => {
    const name = ev.currentTarget.value;
    if (name in datasets) {
      setDataset(datasets[name as keyof typeof datasets]);
    }
  };

  const handleChangePivot = (ev: ChangeEvent<HTMLSelectElement>) => {
    const name = ev.currentTarget.value;
    setPivot(data?.dataCubeByIri?.dimensions.find((d) => d.iri === name));
  };

  const [{ data, fetching }] = useDataCubeObservationsQuery({
    variables: {
      iri: dataset.iri,
      sourceUrl: "https://int.lindas.admin.ch/query",
      sourceType: "sparql",
      locale: "en",
    },
  });

  const dimensions = data?.dataCubeByIri?.dimensions;
  const measures = data?.dataCubeByIri?.measures;

  const observations = useMemo(() => {
    return data?.dataCubeByIri?.observations?.data || [];
  }, [data]);

  const { pivotted, pivotUniqueValues } = useMemo(() => {
    if (!pivot || !dimensions || !measures) {
      return {
        pivotted: [],
        pivotUniqueValues: [],
      };
    } else {
      const restDimensions = dimensions.filter((f) => f !== pivot) || [];
      const pivotGroups = Object.values(
        groupBy(observations, (x) =>
          restDimensions?.map((d) => x[d.iri]).join("/")
        )
      );
      const pivotUniqueValues = new Set<Observation[string]>();
      const pivotted = pivotGroups.map((g) => {
        // Start from values that should be the same
        const res = Object.fromEntries(
          restDimensions.map((d) => [d.iri, g[0][d.iri]])
        );
        for (let item of g) {
          res[`${pivot.iri}/${item[pivot.iri]}`] = Object.fromEntries(
            measures.map((m) => [m.iri, item[m.iri]])
          );
          pivotUniqueValues.add(item[pivot.iri]);
        }
        return res;
      });
      return {
        pivotted,
        pivotUniqueValues: Array.from(pivotUniqueValues).sort(),
      } as const;
    }
  }, [pivot, dimensions, measures, observations]);

  const columns = useMemo((): Column<Observation>[] => {
    if (!dimensions || !measures) {
      return [];
    } else if (pivot) {
      const dimensionColumns: Column<Observation>[] = dimensions
        .filter((d) => d.iri !== pivot.iri)
        .map((d) => ({
          accessor: (x: Observation) => x[d.iri],
          Header: d.label,
        }));

      const pivotColumns: Column<Observation>[] = pivotUniqueValues.map(
        (uv) => ({
          Header: uv,
          columns: measures
            .filter((m) => activeMeasures?.[m.iri])
            .map((m) => ({
              Header: m.label,
              id: `${pivot.iri}/${uv}/${m.iri}`,
              accessor: (x) => {
                return x[`${pivot.iri}/${uv}`]?.[m.iri] || "";
              },
            })),
        })
      );

      return [...dimensionColumns, ...pivotColumns];
    } else {
      const all = [...dimensions, ...measures];
      return all.map((d) => {
        return {
          accessor: (x) => x[d.iri],
          Header: d.label,
        };
      });
    }
  }, [
    data?.dataCubeByIri,
    pivot,
    pivotUniqueValues,
    dimensions,
    measures,
    activeMeasures,
  ]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns: columns,
        data: pivot ? pivotted : observations,
      }
      //   useExpanded // Use the useExpanded plugin hook
    );

  useEffect(() => {
    if (!activeMeasures && measures) {
      setActiveMeasures(Object.fromEntries(measures.map((m) => [m.iri, true])));
    }
  }, [measures]);

  const handleToggleMeasure = useEvent((ev: ChangeEvent<HTMLInputElement>) => {
    const measureIri = ev.currentTarget.getAttribute("name");
    if (!measureIri) {
      return;
    }
    setActiveMeasures((am) =>
      am ? { ...am, [measureIri]: !am[measureIri] } : undefined
    );
  });

  const classes = useStyles();

  return (
    <Box m={5}>
      <Typography variant="h2">Pivot table</Typography>
      <Typography variant="overline" display="block">
        Dataset
      </Typography>
      <select onChange={handleChangeDataset} value={dataset.iri}>
        {Object.keys(datasets).map((k) => {
          const dataset = datasets[k as keyof typeof datasets];
          return <option value={dataset.iri}>{dataset.label}</option>;
        })}
      </select>
      <Card>
        <Typography variant="h6">Config</Typography>
        <Typography variant="overline" display="block">
          Pivot iri
        </Typography>
        <select onChange={handleChangePivot} value={pivot?.iri || "-"}>
          <option value="-">-</option>
          {data?.dataCubeByIri?.dimensions.map((d) => {
            return <option value={d.iri}>{d.label}</option>;
          })}
        </select>
        <Typography variant="overline" display="block">
          Measures
        </Typography>
        {measures?.map((m) => {
          return (
            <FormControlLabel
              label={m.label}
              componentsProps={{ typography: { variant: "body2" } }}
              control={
                <Switch
                  size="small"
                  checked={activeMeasures?.[m.iri]}
                  onChange={handleToggleMeasure}
                  name={m.iri}
                />
              }
            />
          );
        })}
      </Card>
      <Card>
        <Typography variant="h6">Debug</Typography>

        <Typography variant="overline" display="block">
          Columns
        </Typography>
        <Inspector data={columns} />
        <Typography variant="overline" display="block">
          Pivotted
        </Typography>
        <Inspector data={pivotted} />
      </Card>
      {fetching ? <Loading /> : null}
      <table {...getTableProps()} className={classes.table}>
        <thead>
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // eslint-disable-next-line react/jsx-key
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              // eslint-disable-next-line react/jsx-key
              <tr {...row.getRowProps()}>
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
    </Box>
  );
};

export default Page;
