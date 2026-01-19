import {
  CircularProgress,
  FormControlLabel,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Meta } from "@storybook/react";
import { useState } from "react";

import { Tag } from "@/components/tag";
import { useDataCubeComponentTermsetsQuery } from "@/graphql/query-hooks";

export const Termsets = () => {
  const [cube, setCube] = useState<string>(
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9"
  );
  const [result] = useDataCubeComponentTermsetsQuery({
    variables: {
      locale: "en",
      sourceType: "sparql",
      sourceUrl: "https://lindas-cached.int.cz-aws.net/query",
      cubeFilter: {
        iri: cube,
      },
    },
  });

  const { data } = result;

  return (
    <div>
      <h2>Termsets</h2>
      <Stack gap={1} direction="column" alignItems="start">
        <FormControlLabel
          label="Compatible cube"
          labelPlacement="start"
          control={
            <Stack gap={1} direction="row" alignItems="center">
              <Select
                size="sm"
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
              {result.fetching ? <CircularProgress size={12} /> : null}
            </Stack>
          }
        />
      </Stack>

      {result.error ? <div>Error: {result.error.message}</div> : null}

      <Stack mt={2} gap={2} direction="column">
        {data?.dataCubeComponentTermsets?.map((componentTermsets) => {
          return (
            <Stack gap={1} direction="column" key={componentTermsets.iri}>
              <Typography variant="body2">{componentTermsets.label}</Typography>
              <Typography variant="caption">{componentTermsets.iri}</Typography>
              <Stack gap={1} direction="row">
                {componentTermsets.termsets.map((termset) => {
                  return (
                    <Tag key={termset.iri} type="termset">
                      {termset.label}
                    </Tag>
                  );
                })}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </div>
  );
};

export default {
  title: "Data / Termsets",
} as Meta;
