import {
  Box,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { ObjectInspector } from "react-inspector";
import { Client, Provider } from "urql";

import { DatasetResult } from "@/browser/dataset-browse";
import { truthy } from "@/domain/types";
import {
  SearchCubeFilterType,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";

export const SharedDimensions = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [cube, setCube] = useState<string>(
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9"
  );
  const [temporalDimension, setTemporalDimension] = useState("-");
  const [result] = useSearchCubesQuery({
    variables: {
      locale: "en",
      sourceType: "sparql",
      sourceUrl: "https://lindas.admin.ch/query",
      filters: [
        {
          type: SearchCubeFilterType.SharedDimension,
          value: cube,
        },
        temporalDimension !== "-"
          ? {
              type: SearchCubeFilterType.TemporalDimension,
              value: temporalDimension,
            }
          : null,
      ].filter(truthy),
      includeDrafts: false,
      query,
    },
  });

  if (result.fetching) {
    return <div>Loading...</div>;
  }

  if (result.error) {
    return <div>Error: {result.error.message}</div>;
  }

  const { data } = result;

  return (
    <div>
      <h2>Search results</h2>
      <Stack gap={1} direction="column" alignItems="start">
        <FormControlLabel
          label="Query"
          labelPlacement="start"
          control={
            <TextField
              label="Search"
              size="small"
              placeholder="Search"
              value={inputValue}
              onChange={(ev) => {
                const value = (ev.target as HTMLInputElement).value;
                setInputValue(value);
              }}
              onKeyUp={(ev) => {
                if (ev.key === "Enter") {
                  setQuery(inputValue);
                }
              }}
            />
          }
        />

        <FormControlLabel
          label="Compatible cube"
          labelPlacement="start"
          control={
            <Select
              size="small"
              native
              onChange={(ev) => setCube(ev.target.value)}
              value={cube}
            >
              <option value="https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9">
                Einmalvergütung für Photovoltaikanlagen
              </option>
              <option value="https://environment.ld.admin.ch/foen/nfi/nfi_C-1029/cube/2023-1">
                NFI Topics by stage of stand development
              </option>
              <option value="https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_auszahlungen/8">
                Gebäudeprogramm - Auszahlungen nach Massnahmenbereich und
                Berichtsjahr
              </option>
            </Select>
          }
        />

        <FormControlLabel
          label={"Temporal dimension"}
          labelPlacement="start"
          control={
            <Select
              value={temporalDimension}
              onChange={(ev) => setTemporalDimension(ev.target.value as string)}
            >
              <MenuItem value="-">-</MenuItem>
              <MenuItem value="Year">Year</MenuItem>
              <MenuItem value="Month">Month</MenuItem>
            </Select>
          }
        />
      </Stack>

      <Box my={2}>
        <ObjectInspector data={data} />
      </Box>

      {data?.searchCubes.map((item) => (
        <DatasetResult key={item.cube.iri} dataCube={item.cube} showTermsets />
      ))}
    </div>
  );
};

const graphqlURL =
  process.env.NODE_ENV === "production"
    ? "/api/graphql"
    : "http://localhost:3000/api/graphql";

// Define your Storybook story
export default {
  title: "Data / Search",
  decorators: [
    (Story) => {
      const client = new Client({ url: graphqlURL });
      return (
        <Provider value={client}>
          <Story />
        </Provider>
      );
    },
  ],
} as Meta;
