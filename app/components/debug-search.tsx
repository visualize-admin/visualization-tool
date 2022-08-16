import { Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import React from "react";

import { DataCubeSearchFilter, useDataCubesQuery } from "@/graphql/query-hooks";

const Search = ({
  query,
  locale,
  filters,
  includeDrafts,
}: {
  query: string;
  locale: string;
  filters: DataCubeSearchFilter[];
  includeDrafts?: boolean;
}) => {
  const [cubes] = useDataCubesQuery({
    variables: {
      locale: locale,
      query: query,
      filters: filters,
      includeDrafts: !!includeDrafts,
      sourceUrl: "https://int.lindas.admin.ch/query",
      sourceType: "sparql",
    },
  });
  return (
    <Box>
      <Typography variant="h5">&quot;{query}&quot;</Typography>
      <Typography
        variant="caption"
        color={cubes.data?.dataCubes.length === 0 ? "error" : undefined}
      >
        {cubes.data?.dataCubes.length} results
      </Typography>
      <Stack spacing={4}>
        {cubes.data?.dataCubes.map((c) => {
          return (
            <div key={c.dataCube.iri}>
              <Typography variant="h6">{c.highlightedTitle}</Typography>
              <Typography variant="caption">
                {c?.highlightedDescription?.slice(0, 100) ?? "" + "..."}
              </Typography>
              <br />
              <Typography variant="caption">{c?.dataCube?.iri}</Typography>
              <Stack spacing={2} direction="row">
                {c?.dataCube.themes.map((t) => (
                  <Chip key={t.iri} size="small" label={t.label} />
                ))}
              </Stack>
            </div>
          );
        })}
      </Stack>
    </Box>
  );
};

const territoryTheme = {
  type: "DataCubeTheme",
  value: "https://register.ld.admin.ch/opendataswiss/category/territory",
};

const geographyTheme = {
  type: "DataCubeTheme",
  value: "https://register.ld.admin.ch/opendataswiss/category/geography",
};

const bafuCreator = {
  type: "DataCubeOrganization",
  value:
    "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-umwelt-bafu",
};

const mobilityTheme = {
  type: "DataCubeTheme",
  value: "https://register.ld.admin.ch/opendataswiss/category/mobility",
};

const DebugSearch = () => {
  return (
    <Box
      sx={{
        margin: "1rem",
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(1fr, 300px))",
      }}
    >
      <Search
        query="bruit"
        filters={[mobilityTheme]}
        locale="fr"
        includeDrafts
      />
      <Search
        query="Bathing"
        filters={[territoryTheme]}
        includeDrafts
        locale="en"
      />
      <Search query="Ausgaben" filters={[]} locale="de" />

      <Search query="" filters={[territoryTheme]} locale="en" />
      <Search query="SFOE" filters={[geographyTheme]} locale="en" />
      <Search query="National economy" filters={[]} locale="en" />
      <Search query="Einmalvergütung" filters={[]} locale="de" />
      <Search query="zeitverzögert" filters={[]} locale="de" includeDrafts />
      <Search query="öffentlich" filters={[]} locale="de" includeDrafts />
      <Search query="WASTA" filters={[]} locale="en" />
      <Search query="SFA" filters={[]} locale="en" />
    </Box>
  );
};

export default DebugSearch;
