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
  Typography,
} from "@mui/material";
import { Meta } from "@storybook/react";
import keyBy from "lodash/keyBy";
import { useEffect, useState } from "react";
import { ObjectInspector } from "react-inspector";

import { DatasetResult } from "@/browser/dataset-browse";
import { Error } from "@/components/hint";
import Tag from "@/components/tag";
import { ComponentTermsets } from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  DataCubeComponentTermsetsQueryVariables,
  SearchCubeFilterType,
  useDataCubeComponentTermsetsQuery,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";

const options = [
  {
    id: "0",
    cubeIri: "https://environment.ld.admin.ch/foen/nfi/nfi_C-1029/cube/2023-1",
    sourceType: "sparql",
    sourceUrl: "https://lindas.admin.ch/query",
    label: "NFI Topics by stage of stand development",
  },
  {
    id: "1",
    cubeIri:
      "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
    sourceType: "sparql",
    sourceUrl: "https://lindas.admin.ch/query",
    label: "Einmalvergütung für Photovoltaikanlagen",
  },
  {
    id: "2",
    cubeIri:
      '"https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_auszahlungen/8',
    sourceType: "sparql",
    sourceUrl: "https://lindas.admin.ch/query",
    label:
      "Gebäudeprogramm - Auszahlungen nach Massnahmenbereich und Berichtsjahr",
  },
];

export const Search = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [optionId, setOptionId] = useState<string>("0");

  const [temporalDimension, setTemporalDimension] = useState("-");
  const [sharedComponents, setSharedComponents] = useState<
    ComponentTermsets["iri"][] | undefined
  >(undefined);

  const chosenOption = options.find((x) => x.id === optionId)!;
  const [cubeTermsetsResults] = useDataCubeComponentTermsetsQuery({
    variables: {
      locale: "en",
      sourceType: chosenOption.sourceType,
      sourceUrl: chosenOption.sourceUrl,
      cubeFilter: {
        iri: chosenOption.cubeIri,
      },
    },
  });

  const cubeSharedDimensionsByIri = keyBy(
    cubeTermsetsResults.data?.dataCubeComponentTermsets ?? [],
    (x) => x.iri
  );

  const [searchCubesResult] = useSearchCubesQuery({
    pause: !sharedComponents || sharedComponents.length === 0,
    variables: {
      locale: "en",
      sourceType: "sparql",
      sourceUrl: "https://int.lindas.admin.ch/query",
      filters: [
        sharedComponents
          ? {
              type: SearchCubeFilterType.DataCubeTermset,
              value: sharedComponents
                .map((x) => cubeSharedDimensionsByIri[x])
                .filter(truthy)
                .flatMap((x) => x.termsets.map((x) => x.iri))
                ?.join(";"),
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
      fetchDimensionTermsets: true,
      query,
    },
  });

  const handleChangeSharedDimensions = (
    ev: SelectChangeEvent<typeof sharedComponents>
  ) => {
    const {
      target: { value },
    } = ev;
    setSharedComponents(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleChangeCube = (ev: SelectChangeEvent<string>) => {
    setOptionId(ev.target.value);
    setSharedComponents(undefined);
  };

  useEffect(() => {
    if (
      sharedComponents === undefined &&
      cubeTermsetsResults?.data?.dataCubeComponentTermsets &&
      chosenOption.cubeIri ===
        (
          cubeTermsetsResults.operation
            ?.variables as DataCubeComponentTermsetsQueryVariables
        ).cubeFilter?.iri
    ) {
      setSharedComponents(
        cubeTermsetsResults?.data?.dataCubeComponentTermsets.map((x) => x.iri)
      );
    }
  }, [cubeTermsetsResults, sharedComponents, chosenOption.cubeIri]);

  return (
    <div>
      <h2>Search results</h2>
      {chosenOption.cubeIri}
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
              size="sm"
              native
              onChange={handleChangeCube}
              value={optionId ?? "0"}
            >
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          }
        />

        <FormControlLabel
          label="Join by"
          labelPlacement="start"
          control={
            <Stack gap={1} alignItems="center" direction="row">
              <Select
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                value={sharedComponents ?? []}
                onChange={handleChangeSharedDimensions}
                input={
                  <OutlinedInput
                    notched={false}
                    id="select-multiple-chip"
                    label="Chip"
                  />
                }
                renderValue={(selected) =>
                  selected && selected.length
                    ? selected.map((value) => (
                        <Tag key={value} type="termset" sx={{ mr: 1 }}>
                          {cubeSharedDimensionsByIri?.[value]?.label}
                        </Tag>
                      ))
                    : "-"
                }
              >
                {cubeTermsetsResults?.data?.dataCubeComponentTermsets?.map(
                  (sd) => (
                    <MenuItem
                      key={sd.label}
                      value={sd.iri}
                      sx={{ gap: 2, alignItems: "start" }}
                    >
                      <Checkbox
                        checked={
                          sharedComponents && sharedComponents.includes(sd.iri)
                        }
                      />
                      <ListItemText
                        primary={sd.label}
                        secondary={
                          <>
                            <Stack
                              gap={1}
                              width={400}
                              flexDirection="row"
                              flexWrap="wrap"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                component="div"
                                mb={1}
                              >
                                Joined by{" "}
                              </Typography>
                              {sd.termsets.map((t) => (
                                <Tag
                                  key={t.iri}
                                  type="termset"
                                  typography="caption"
                                  sx={{ "&&": { fontSize: 10 } }}
                                >
                                  {t.label}
                                </Tag>
                              ))}
                            </Stack>
                          </>
                        }
                      />
                    </MenuItem>
                  )
                )}
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
        <DatasetResult
          key={item.cube.iri}
          dataCube={item.cube}
          showDimensions
        />
      ))}
    </div>
  );
};

export default {
  title: "Data / Search",
} as Meta;
