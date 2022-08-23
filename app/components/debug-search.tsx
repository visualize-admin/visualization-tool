import { FormControlLabel, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import React, { useRef, useState } from "react";
import { useEffect } from "react";

import { DataCubeSearchFilter, useDataCubesQuery } from "@/graphql/query-hooks";

const territoryTheme = {
  name: "Territory theme",
  type: "DataCubeTheme",
  value: "https://register.ld.admin.ch/opendataswiss/category/territory",
};

const geographyTheme = {
  name: "Geography theme",
  type: "DataCubeTheme",
  value: "https://register.ld.admin.ch/opendataswiss/category/geography",
};

const bafuCreator = {
  name: "BAFU creator",
  type: "DataCubeOrganization",
  value:
    "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-umwelt-bafu",
};

const mobilityTheme = {
  name: "Mobility theme",
  type: "DataCubeTheme",
  value: "https://register.ld.admin.ch/opendataswiss/category/mobility",
};

const Search = ({
  query,
  locale,
  filters,
  includeDrafts,
  sourceUrl,
}: {
  query: string;
  locale: string;
  filters: (DataCubeSearchFilter & { name: string })[];
  includeDrafts: boolean;
  sourceUrl: string;
}) => {
  const startTimeRef = useRef(0);
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [query, locale, includeDrafts]);

  const [cubes] = useDataCubesQuery({
    variables: {
      locale: locale,
      query: query,
      filters: filters.map(({ type, value }) => ({ type, value })),
      includeDrafts,
      sourceUrl,
      sourceType: "sparql",
    },
  });

  useEffect(() => {
    if (cubes.data) {
      setEndTime(Date.now());
    }
  }, [cubes.data]);

  const responseTime =
    startTimeRef.current && endTime
      ? endTime - startTimeRef.current
      : undefined;

  return (
    <Box>
      <Typography variant="h5">
        &quot;{query}&quot;&nbsp;
        {filters
          ? filters.map((f) => (
              <Chip key={f.value} size="small" label={f.name} />
            ))
          : null}
      </Typography>

      {cubes.fetching ? (
        <CircularProgress />
      ) : (
        <div>
          <Typography
            variant="caption"
            color={cubes.data?.dataCubes.length === 0 ? "error" : undefined}
          >
            {cubes.data?.dataCubes.length} results |{" "}
          </Typography>
          <Typography
            variant="caption"
            color={responseTime && responseTime > 1500 ? "error" : undefined}
          >
            {responseTime !== undefined ? `${responseTime}ms` : ""}
          </Typography>
        </div>
      )}
      {cubes.error ? (
        <Typography color="error">{cubes.error.message}</Typography>
      ) : null}
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
                <Chip size="small" label={c?.dataCube.publicationStatus} />
              </Stack>
            </div>
          );
        })}
      </Stack>
    </Box>
  );
};

const DebugSearch = () => {
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(
    "https://int.lindas.admin.ch/query"
  );
  return (
    <Box
      sx={{
        margin: "1rem",
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(1fr, 300px))",
      }}
    >
      <FormControlLabel
        label="Drafts"
        control={
          <Switch
            value={includeDrafts}
            onChange={(_ev, checked) => setIncludeDrafts(checked)}
          />
        }
      />
      <Select
        onChange={(ev) => setSourceUrl(ev.target.value)}
        value={sourceUrl}
      >
        <MenuItem value="https://int.lindas.admin.ch/query">int</MenuItem>
        <MenuItem value="https://lindas.admin.ch/query">prod</MenuItem>
      </Select>
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="bruit"
        filters={[]}
        locale="fr"
      />
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="Bathing"
        filters={[territoryTheme]}
        locale="en"
      />
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="bath"
        filters={[territoryTheme]}
        locale="en"
      />
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="Ausgaben"
        filters={[]}
        locale="de"
      />

      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query=""
        filters={[territoryTheme]}
        locale="en"
      />
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="SFOE"
        filters={[geographyTheme]}
        locale="en"
      />
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="National economy"
        filters={[]}
        locale="en"
      />
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="Einmalvergütung"
        filters={[]}
        locale="de"
      />
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="zeitverzögert"
        filters={[]}
        locale="de"
      />
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="öffentlich"
        filters={[]}
        locale="de"
      />
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="WASTA"
        filters={[]}
        locale="en"
      />
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="tari"
        filters={[]}
        locale="en"
      />
      <Search
        sourceUrl={sourceUrl}
        includeDrafts={includeDrafts}
        query="SFA"
        filters={[]}
        locale="en"
      />
    </Box>
  );
};

export default DebugSearch;
