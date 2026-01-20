import { Box, Chip, FormControlLabel, Stack } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { KeyboardEventHandler, useEffect, useRef, useState } from "react";

import {
  SearchCubeFilter,
  SearchCubeFilterType,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";
import { RequestQueryMeta } from "@/graphql/query-meta";

const territoryTheme = {
  name: "Territory theme",
  type: SearchCubeFilterType.DataCubeTheme,
  value: "https://register.ld.admin.ch/opendataswiss/category/territory",
};

const geographyTheme = {
  name: "Geography theme",
  type: SearchCubeFilterType.DataCubeTheme,
  value: "https://register.ld.admin.ch/opendataswiss/category/geography",
};

// @ts-ignore
const bafuCreator = {
  name: "BAFU creator",
  type: SearchCubeFilterType.DataCubeOrganization,
  value:
    "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-umwelt-bafu",
};

// @ts-ignore
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
  filters: (SearchCubeFilter & { name: string })[];
  includeDrafts: boolean;
  sourceUrl: string;
}) => {
  const startTimeRef = useRef(0);
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [query, locale, includeDrafts]);

  const [cubes] = useSearchCubesQuery({
    variables: {
      locale,
      query,
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

  const queries = cubes?.extensions?.queries as RequestQueryMeta[] | undefined;

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
            color={cubes.data?.searchCubes.length === 0 ? "error" : undefined}
          >
            {cubes.data?.searchCubes.length} results |{" "}
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
        {cubes.data?.searchCubes.map(
          ({ cube, highlightedTitle, highlightedDescription }) => {
            return (
              <div key={cube.iri}>
                <Typography
                  variant="h6"
                  dangerouslySetInnerHTML={{ __html: highlightedTitle! }}
                />
                <Typography
                  variant="caption"
                  dangerouslySetInnerHTML={{
                    __html: highlightedDescription?.slice(0, 100) ?? "" + "...",
                  }}
                />
                <br />
                <Typography variant="caption">{cube.iri}</Typography>
                <Stack spacing={2} direction="row">
                  {cube.themes.map((t) => (
                    <Chip key={t.iri} size="small" label={t.label} />
                  ))}
                  <Chip size="small" label={cube.publicationStatus} />
                </Stack>
              </div>
            );
          }
        )}
      </Stack>
      <Accordion sx={{ mt: 2, borderTop: 0 }}>
        <AccordionSummary sx={{ typography: "h4" }}>queries</AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {queries
              ? queries.map((q, i) => {
                  return (
                    <div key={i}>
                      <Typography variant="h5">{q.label}</Typography>
                      <Stack direction="row" spacing={4}>
                        <div>
                          <Typography variant="overline">Duration</Typography>
                          <Typography variant="body2">
                            {q.endTime - q.startTime}ms
                          </Typography>
                        </div>
                      </Stack>
                      <Accordion sx={{ mt: 2 }}>
                        <AccordionSummary sx={{ typography: "overline" }}>
                          Query
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box component="pre" sx={{ fontSize: "small" }}>
                            {q.text}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </div>
                  );
                })
              : null}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export const DebugSearch = () => {
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(
    "https://lindas.int.cz-aws.net/query"
  );

  const [customSearch, setCustomSearch] = useState("");
  const handleKeyUp: KeyboardEventHandler<HTMLDivElement> = (ev) => {
    if (ev.key === "Enter") {
      if (!ev.target) {
        return;
      }
      setCustomSearch((ev.target as HTMLInputElement).value);
    }
  };

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
        <MenuItem value="https://lindas.int.cz-aws.net/query">int</MenuItem>
        <MenuItem value="https://lindas.cz-aws.net/query">prod</MenuItem>
      </Select>
      <TextField
        defaultValue=""
        placeholder="Search..."
        onKeyUp={handleKeyUp}
      />
      {customSearch !== "" ? (
        <Search
          key={customSearch}
          sourceUrl={sourceUrl}
          includeDrafts={includeDrafts}
          query={customSearch}
          filters={[]}
          locale="fr"
        />
      ) : (
        <>
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
          <Search
            sourceUrl={sourceUrl}
            includeDrafts={includeDrafts}
            query="émissions de gaz à effet de serre"
            filters={[]}
            locale="fr"
          />
        </>
      )}
    </Box>
  );
};
