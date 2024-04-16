import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";
import { Meta } from "@storybook/react";
import keyBy from "lodash/keyBy";
import { useEffect, useState } from "react";
import { ObjectInspector } from "react-inspector";

import { DatasetResult } from "@/browser/dataset-browse";
import { Error } from "@/components/hint";
import Tag from "@/components/tag";
import { Termset } from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  SearchCubeFilterType,
  useDataCubeTermsetsQuery,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";

export const Search = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [cube, setCube] = useState<string>(
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9"
  );
  const [temporalDimension, setTemporalDimension] = useState("-");
  const [sharedDimensions, setSharedDimensions] = useState<
    Termset["iri"][] | undefined
  >(undefined);

  const [cubeTermsetsResults] = useDataCubeTermsetsQuery({
    variables: {
      locale: "en",
      sourceType: "sparql",
      sourceUrl: "https://lindas.admin.ch/query",
      cubeFilter: {
        iri: cube,
      },
    },
  });

  const [searchCubesResult] = useSearchCubesQuery({
    pause: !sharedDimensions || sharedDimensions.length === 0,
    variables: {
      locale: "en",
      sourceType: "sparql",
      sourceUrl: "https://lindas.admin.ch/query",
      filters: [
        sharedDimensions
          ? {
              type: SearchCubeFilterType.SharedDimensions,
              value: sharedDimensions?.join(";"),
            }
          : null,
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

  const handleChangeSharedDimensions = (
    ev: SelectChangeEvent<typeof sharedDimensions>
  ) => {
    const {
      target: { value },
    } = ev;
    setSharedDimensions(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  useEffect(() => {
    if (
      sharedDimensions === undefined &&
      cubeTermsetsResults?.data?.dataCubeTermsets
    ) {
      setSharedDimensions(
        cubeTermsetsResults?.data?.dataCubeTermsets.map((sd) => sd.iri)
      );
    }
  }, [cubeTermsetsResults, sharedDimensions]);

  const cubeSharedDimensionsByIri = keyBy(
    cubeTermsetsResults.data?.dataCubeTermsets ?? [],
    (x) => x.iri
  );

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
          label="Termsets"
          labelPlacement="start"
          control={
            <Stack gap={1} alignItems="center" direction="row">
              <Select
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                value={sharedDimensions ?? []}
                onChange={handleChangeSharedDimensions}
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                renderValue={(selected) =>
                  selected.map((value) => (
                    <Tag key={value} type="termset" sx={{ mr: 1 }}>
                      {cubeSharedDimensionsByIri?.[value]?.label}
                    </Tag>
                  ))
                }
              >
                {(
                  cubeTermsetsResults?.data?.dataCubeTermsets as Termset[]
                )?.map((sd) => (
                  <MenuItem
                    key={sd.label}
                    value={sd.iri}
                    sx={{ gap: 2, alignItems: "start" }}
                  >
                    <Checkbox
                      checked={
                        sharedDimensions && sharedDimensions.includes(sd.iri)
                      }
                    />
                    <ListItemText primary={sd.label} secondary={sd.iri} />
                  </MenuItem>
                ))}
              </Select>
              {cubeTermsetsResults.fetching ? (
                <CircularProgress size={12} />
              ) : null}
            </Stack>
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
        <ObjectInspector data={searchCubesResult.data} />
      </Box>
      {searchCubesResult.fetching ? <CircularProgress size={12} /> : null}
      {searchCubesResult.error ? (
        <Error>{searchCubesResult.error.message}</Error>
      ) : null}

      {searchCubesResult?.data?.searchCubes.map((item) => (
        <DatasetResult key={item.cube.iri} dataCube={item.cube} showTermsets />
      ))}
    </div>
  );
};

export default {
  title: "Data / Search",
} as Meta;
