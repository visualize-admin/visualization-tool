import {
  alpha,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
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

const combinations: {
  id: number;
  name: string;
  cubes: ChartConfig["cubes"];
  sourceUrl: string;
}[] = [
  {
    id: 1,
    name: "Photovoltaik + Hydropowerplants",
    sourceUrl: "https://lindas.int.cz-aws.net/query",
    cubes: [
      {
        iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/14",
        filters: {
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton":
            { type: "single", value: "https://ld.admin.ch/canton/1" },
        },
        joinBy: [
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
        ],
      },
      {
        iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/7",
        joinBy: [
          "https://energy.ld.admin.ch/sfoe/bfe_ogd40_wasta/YearOfStatistic",
        ],
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
  {
    id: 2,
    name: "Photovoltaik + Photovoltaik GEB",
    sourceUrl: "https://lindas.int.cz-aws.net/query",
    cubes: [
      {
        iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/14",
        filters: {
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr":
            {
              type: "single",
              value: "2020",
            },
        },
        joinBy: [
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
        ],
      },
      {
        iri: "https://energy.ld.admin.ch/sfoe/OGD84GebTest/1",
        joinBy: ["https://energy.ld.admin.ch/sfoe/OGD84GebTest/Kanton"],
        filters: {
          "https://energy.ld.admin.ch/sfoe/OGD84GebTest/Jahr": {
            type: "single",
            value: "2020",
          },
        },
      },
    ],
  },
  {
    id: 3,
    name: "NFI Cube + Electrical consumption",
    sourceUrl: "https://lindas.int.cz-aws.net/query",
    cubes: [
      {
        iri: "https://environment.ld.admin.ch/foen/nfi/nfi_T-changes/cube/2024-1",
        filters: {
          "https://environment.ld.admin.ch/foen/nfi/classificationUnit": {
            type: "single",
            value:
              "https://environment.ld.admin.ch/foen/nfi/ClassificationUnit/Total",
          },
          "https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation": {
            type: "single",
            value:
              "https://environment.ld.admin.ch/foen/nfi/UnitOfEvaluation/2382",
          },
          "https://environment.ld.admin.ch/foen/nfi/grid": {
            type: "single",
            value: "https://environment.ld.admin.ch/foen/nfi/Grid/410",
          },
          "https://environment.ld.admin.ch/foen/nfi/evaluationType": {
            type: "single",
            value: "https://environment.ld.admin.ch/foen/nfi/EvaluationType/3",
          },
        },
        joinBy: ["https://environment.ld.admin.ch/foen/nfi/unitOfReference"],
      },
      {
        iri: "https://energy.ld.admin.ch/elcom/electricityprice-canton",
        joinBy: [
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/canton",
        ],
        filters: {
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/category":
            {
              type: "single",
              value:
                "https://energy.ld.admin.ch/elcom/electricityprice/category/C1",
            },
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/period":
            { type: "single", value: "2011" },
          "https://energy.ld.admin.ch/elcom/electricityprice/dimension/product":
            {
              type: "single",
              value:
                "https://energy.ld.admin.ch/elcom/electricityprice/product/standard",
            },
        },
      },
    ],
  },
  {
    id: 4,
    name: "NFI Change + Photovoltaik",
    sourceUrl: "https://lindas.admin.ch/query",
    cubes: [
      {
        iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
        joinBy: [
          "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Kanton",
        ],
        filters: {},
      },
      {
        iri: "https://environment.ld.admin.ch/foen/nfi/nfi_T-changes/cube/2024-1",
        joinBy: ["https://environment.ld.admin.ch/foen/nfi/unitOfReference"],
        filters: {},
      },
    ],
  },
];
const useStyles = makeStyles((theme: Theme) => ({
  row: {
    borderBottom: "1px solid",
    borderBottomColor: theme.palette.divider,
  },
}));
export const JoinBy = () => {
  const [combination, setCombination] = useState(() => combinations[1]);
  const commonQueryVariables = {
    locale: "en",
    sourceType: "sparql",
    sourceUrl: combination.sourceUrl,
  };

  const [{ data: componentsData, fetching: fetchingComponents }] =
    useDataCubesComponentsQuery({
      chartConfig: {
        conversionUnitsByComponentId: {},
      } as ChartConfig,
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
        (x) => x.id
      ),
    [componentsData]
  );

  const [{ data: observationsData, fetching: fetchingObservations }] =
    useDataCubesObservationsQuery({
      chartConfig: {
        conversionUnitsByComponentId: {},
      } as ChartConfig,
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

  const classes = useStyles();
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
              {combination.name} <small>({combination.sourceUrl})</small>
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
              <TableRow key={index} className={classes.row}>
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
