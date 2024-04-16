import {
  CircularProgress,
  FormControlLabel,
  Select,
  Stack,
} from "@mui/material";
import { Meta } from "@storybook/react";
import { useState } from "react";

import Tag from "@/components/tag";
import { useDataCubeTermsetsQuery } from "@/graphql/query-hooks";

export const Termsets = () => {
  const [cube, setCube] = useState<string>(
    "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9"
  );
  const [result] = useDataCubeTermsetsQuery({
    variables: {
      locale: "en",
      sourceType: "sparql",
      sourceUrl: "https://lindas.admin.ch/query",
      cubeFilter: {
        iri: cube,
        latest: true,
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
              {result.fetching ? <CircularProgress size={12} /> : null}
            </Stack>
          }
        />
      </Stack>

      {result.error ? <div>Error: {result.error.message}</div> : null}

      <Stack mt={2} gap={2} direction="row">
        {data?.dataCubeTermsets?.map((termset) => (
          <Tag key={termset.iri} type="termset">
            {termset.label}
          </Tag>
        ))}
      </Stack>
    </div>
  );
};

export default {
  title: "Data / Termsets",
} as Meta;
