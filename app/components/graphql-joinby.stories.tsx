import {
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  alpha,
} from "@mui/material";
import { Meta } from "@storybook/react";
import { scaleOrdinal } from "d3-scale";
import { schemeTableau10 } from "d3-scale-chromatic";
import keyBy from "lodash/keyBy";
import { useMemo, useState } from "react";
import { ObjectInspector } from "react-inspector";

import { ChartConfig } from "@/configurator";
import { truthy } from "@/domain/types";
import {
  useDataCubesComponentsQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";

const combinations: [
  {
    id: number;
    name: string;
    cubes: ChartConfig["cubes"];
  },
] = [
  {
    id: 1,
    name: "Photovoltaik + Hydropowerplants",
    cubes: [
      {
        iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/14",
        filters: {
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton":
            { type: "single", value: "https://ld.admin.ch/canton/1" },
        },
        joinBy:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
      },
      {
        iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/7",
        joinBy:
          "https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/YearOfStatistic",
        filters: {
          "http://purl.org/dc/terms/identifier": {
            type: "single",
            value:
              "https://ld.admin.ch/dimension/bgdi/energy/hydropowerplants/023625",
          },
          "https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/OperationalStatus": {
            type: "single",
            value:
              "https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/ogd40_catalog/os1",
          },
        },
      },
    ],
  },
];

export const JoinBy = () => {
  const [combination, setCombination] = useState(() => combinations[0]);
  const commonQueryVariables = {
    locale: "en",
    sourceType: "sparql",
    sourceUrl: "https://int.lindas.admin.ch/query",
  };

  const [{ data: componentsData, fetching: fetchingComponents }] =
    useDataCubesComponentsQuery({
      variables: {
        ...commonQueryVariables,

        cubeFilters: combination.cubes.map((cube) => ({
          iri: cube.iri,
          joinBy: cube.joinBy,
          filters: cube.filters,
        })),
      },
    });

  const componentsByIri = useMemo(
    () =>
      keyBy(
        [
          ...(componentsData?.dataCubesComponents.dimensions ?? []),
          ...(componentsData?.dataCubesComponents.measures ?? []),
        ].filter(truthy),
        (x) => x.iri
      ),
    [componentsData]
  );

  const [{ data: observationsData, fetching: fetchingObservations }] =
    useDataCubesObservationsQuery({
      variables: {
        ...commonQueryVariables,

        cubeFilters: combination.cubes.map((cube) => ({
          iri: cube.iri,
          joinBy: cube.joinBy,
          filters: cube.filters,
        })),
      },
    });

  const colorScale = useMemo(() => scaleOrdinal(schemeTableau10), []);
  if (fetchingObservations || fetchingComponents) {
    return <CircularProgress />;
  }

  if (!componentsData || !observationsData) {
    return <div>Could not fetch data</div>;
  }

  const observations = observationsData.dataCubesObservations.data;
  const tableHead = Object.keys(observations[0]);

  return (
    <div>
      <Stack gap={2}>
        <Select
          value={combination.id}
          onChange={(ev) => {
            const found = combinations.find((x) => x.id === ev.target.value);
            return setCombination(found ?? combinations[0]);
          }}
        >
          {combinations.map((combination) => (
            <MenuItem key={combination.id} value={combination.id}>
              {combination.name}
            </MenuItem>
          ))}
        </Select>
        <ObjectInspector data={combination} />
        <Table size="small">
          <TableHead>
            <TableRow>
              {tableHead.map((key) => (
                <TableCell
                  component="th"
                  style={{
                    backgroundColor: alpha(
                      colorScale(componentsByIri[key]?.cubeIri),
                      0.25
                    ),
                  }}
                  key={key}
                >
                  {componentsByIri[key]?.label ??
                    componentsByIri[key]?.description}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {observations.map((row, index) => (
              <TableRow key={index}>
                {tableHead.map((key) => (
                  <td key={key}>{row[key]}</td>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </div>
  );
};

const meta: Meta = {
  title: "Data / Join By",
};

export default meta;
