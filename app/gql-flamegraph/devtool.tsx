import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Drawer,
  AccordionProps,
  IconButton,
  Grow,
  IconButtonProps,
  Link,
  Theme,
  LinkProps,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { scaleLinear } from "d3-scale";
import { OperationDefinitionNode } from "graphql";
import { print } from "graphql";
import maxBy from "lodash/maxBy";
import minBy from "lodash/minBy";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import mitt from "mitt";
import React, { useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import { Exchange, Operation, OperationResult } from "urql";
import { pipe, tap } from "wonka";

import useDisclosure from "@/configurator/components/use-disclosure";
import useEvent from "@/utils/use-event";

export type Timings = Record<
  string,
  { start: number; end: number; children?: Timings }
>;

const visit = (
  t: Timings,
  visit: (item: Omit<Timings, "children">, parents: readonly string[]) => void
) => {
  const q = [[t, []]] as (readonly [Timings, readonly string[]])[];
  while (q.length) {
    const [item, parents] = q.shift()!;
    visit(item, parents);
    for (let [k, c] of Object.entries(item.children || {})) {
      const next = [c as Timings, [...parents, k] as const] as const;
      q.push(next);
    }
  }
};

type FlatTiming = Omit<Timings[string], "children"> & { path: string[] };

/**
 * Flatten the tree in a list, adding the path to every item
 */
const flatten = (timings: Timings) => {
  const all: FlatTiming[] = [];
  visit(timings, (c, parents) => {
    if (c.start && c.end) {
      all.push({
        ...c,
        path: parents,
      } as unknown as FlatTiming);
    }
  });
  return all;
};

const byStart = (a: FlatTiming, b: FlatTiming) => (a.start < b.start ? -1 : 1);

/**
 * Shows a SVG flamegraph for resolver field timings recorded on the
 * server
 */
const Flamegraph = ({
  timings,
}: {
  /** Sorted timings */
  timings: FlatTiming[];
}) => {
  const rects = useMemo(() => {
    const sorted = timings.sort(byStart);
    const begin = sorted[0].start;

    // normalize so that there is the same amount of seconds per pixels
    // across timelines
    const MAX_REQUEST_TIME = 10 * 1000;
    const pixelScale = scaleLinear([begin, begin + MAX_REQUEST_TIME], [0, 500]);

    return sorted.map((x) => ({
      ...x,
      x0: pixelScale(x.start),
      x1: pixelScale(x.end),
      duration: Math.round(x.end - x.start),
    }));
  }, [timings]);

  const barHeight = 15;
  return (
    <>
      <Box
        sx={{
          position: "relative",
          "& svg text": { fontSize: "10px" },
        }}
      >
        <svg width={900} height={50 + rects.length * barHeight}>
          <g>
            {rects.map((r, i) => (
              <Group left={r.x0} top={i * barHeight} key={i}>
                <rect
                  x={0}
                  y={0}
                  height={barHeight}
                  width={r.x1 - r.x0}
                  fill="#ccc"
                />
                <Text verticalAnchor="start" y={2}>
                  {`${r.duration}ms - ${r.path.join(">")}
          `}
                </Text>
              </Group>
            ))}
          </g>{" "}
        </svg>
      </Box>
    </>
  );
};

const CopyLink = ({ toCopy, ...props }: { toCopy: string } & LinkProps) => {
  const { children, onClick, sx } = props;
  const [hasCopied, setHasCopied] = useState(false);
  const enhancedOnClick = useEvent(
    (ev: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(ev);
      navigator.clipboard.writeText(toCopy);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 1000);
    }
  );
  return (
    <Link
      {...props}
      onClick={enhancedOnClick}
      sx={{ cursor: "pointer", ...sx }}
    >
      {children} {hasCopied ? "✓" : null}
    </Link>
  );
};

/**
 * Collapsible according showing for each request that has been made
 * a accordion with name
 */
const AccordionOperation = ({
  result,
  operation,
  start,
  end,
  ...accordionProps
}: {
  result: OperationResult | undefined;
  operation: Operation;
  start: number;
  end: number;
} & Omit<AccordionProps, "children">) => {
  const duration = useMemo(() => {
    const all = flatten(result?.extensions?.timings).sort(byStart);
    if (all.length === 0) {
      return 0;
    }
    return maxBy(all, (x) => x.end)?.end! - minBy(all, (x) => x.start)?.start!;
  }, [result?.extensions?.timings]);
  return (
    <Accordion {...accordionProps}>
      <AccordionSummary>
        <Box
          sx={{
            "& > * + *:not(:last-child)": {
              marginRight: "0.5rem",
              paddingRight: "0.5rem",
              borderRight: "1px solid",
              borderRightColor: "divider",
            },
          }}
        >
          <Typography variant="body2" sx={{ mb: 0 }}>
            {operation.key}{" "}
            {
              operation.query.definitions.find(
                (d): d is OperationDefinitionNode =>
                  d.kind === "OperationDefinition"
              )?.name?.value
            }
            <Box component="span" sx={{ ml: 2 }}>
              {result ? "✅" : "🔄"}
            </Box>
          </Typography>
          <Typography variant="caption">{duration}ms</Typography>
          <Link
            fontSize="small"
            whiteSpace="break-spaces"
            color="primary"
            href={`http://localhost:3000/api/graphql?query=${encodeURIComponent(
              print(operation.query)
            )}`}
            sx={{ my: 0 }}
            target="_blank"
            rel="noreferrer"
            onClick={(ev) => ev.stopPropagation()}
          >
            See in graphql editor
          </Link>
          <span>
            <CopyLink
              fontSize="small"
              color="primary"
              toCopy={JSON.stringify(operation.variables, null, 2)}
              onClick={(ev) => {
                ev.stopPropagation();
              }}
            >
              Copy variables
            </CopyLink>
          </span>
        </Box>
      </AccordionSummary>
      {accordionProps.expanded ? (
        <AccordionDetails>
          <Box sx={{ display: "grid", gridTemplateColumns: "50% 50%" }}>
            <Box sx={{ overflowX: "scroll" }}>
              <Typography variant="h5" gutterBottom>
                Resolvers
              </Typography>
              <>
                {result?.extensions?.timings ? (
                  <Flamegraph timings={flatten(result.extensions.timings)} />
                ) : null}
              </>
            </Box>
            <div>
              <Typography variant="h5" gutterBottom>
                SPARQL queries ({result?.extensions?.queries.length})
              </Typography>
              <Queries queries={result?.extensions?.queries} />
            </div>
          </Box>
        </AccordionDetails>
      ) : null}
    </Accordion>
  );
};

const Queries = ({
  queries,
}: {
  queries: { startTime: number; endTime: number; text: string }[];
}) => {
  return (
    <div>
      {queries.map((q, i) => {
        const text = q.text.replace(/\n\n/gm, "\n");
        return (
          <div key={i}>
            <Typography variant="caption">
              {q.endTime - q.startTime}ms
            </Typography>{" "}
            -{" "}
            <CopyLink toCopy={q.text} sx={{ fontSize: "small" }}>
              Copy
            </CopyLink>
            <Box
              cols={100}
              rows={10}
              component="textarea"
              fontSize="small"
              value={text}
            />
          </div>
        );
      })}
    </div>
  );
};

const EmojiIconButton = ({
  children,
  ...props
}: { children: React.ReactNode } & IconButtonProps) => {
  return (
    <IconButton
      size="small"
      sx={{
        width: 32,
        height: 32,
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      {...props}
    >
      {children}
    </IconButton>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    textAlign: "right",
    width: "100%",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderBottom: "1px solid",
    borderBottomColor: "divider",
  },
}));

function GqlDebug() {
  const [results, setResults] = useState([] as OperationResult[]);
  const opsStartMapRef = useRef(new Map<Operation["key"], number>());
  const opsEndMapRef = useRef(new Map<Operation["key"], number>());
  useEffect(() => {
    const handleOperation = (operation: Operation) => {
      opsStartMapRef.current.set(operation.key, Date.now());
      opsEndMapRef.current.set(operation.key, Date.now());
    };
    const handleResult = (result: OperationResult) => {
      opsEndMapRef.current.set(result.operation.key, Date.now());
      // Calls setState out of band since handleResult can be called while
      // rendering a component. setState cannot be called while rendering
      // a component.
      setTimeout(() => {
        setResults((results) =>
          uniqBy([...results, result], (x) => x.operation.key)
        );
      }, 0);
    };
    urqlEE.on("urql-received-operation", handleOperation);
    urqlEE.on("urql-received-result", handleResult);
    return () => {
      urqlEE.off("urql-received-operation", handleOperation);
      urqlEE.off("urql-received-result", handleResult);
    };
  });
  const [expandedId, setExpandedId] =
    useState<OperationResult["operation"]["key"]>();
  const handleReset = useEvent(() => {
    setResults([]);
  });
  const { isOpen, open, close } = useDisclosure();
  const classes = useStyles();
  if (typeof window === "undefined") {
    return null;
  }
  return (
    <>
      <Box sx={{ position: "fixed", bottom: 0, right: 0, zIndex: 10 }}>
        <Grow in>
          <IconButton size="small" onClick={open}>
            🛠
          </IconButton>
        </Grow>
      </Box>

      <Drawer
        open={isOpen}
        anchor="bottom"
        elevation={2}
        onBackdropClick={close}
      >
        <div>
          <Box className={classes.toolbar}>
            <EmojiIconButton onClick={handleReset}>🧹</EmojiIconButton>
            <EmojiIconButton onClick={close}>⨯</EmojiIconButton>
          </Box>
          <Box sx={{ maxHeight: "500px" }}>
            {sortBy(results, (r) => opsStartMapRef.current.get(r.operation.key))
              .filter((x) => x?.extensions?.timings)
              .map((result, i) => (
                <AccordionOperation
                  key={i}
                  result={result}
                  operation={result.operation}
                  expanded={expandedId === result.operation.key}
                  start={opsStartMapRef.current.get(result.operation.key)!}
                  end={opsEndMapRef.current.get(result.operation.key)!}
                  onChange={(_e, expanded) =>
                    setExpandedId(expanded ? result.operation.key : undefined)
                  }
                />
              ))}
          </Box>
        </div>
      </Drawer>
    </>
  );
}

/**
 * Used to communicate between urql and the flamegraph
 * component
 */
export const urqlEE = mitt<{
  "urql-received-operation": Operation<any, any>;
  "urql-received-result": OperationResult<any, any>;
}>();

export const gqlFlamegraphExchange: Exchange = ({ forward }) => {
  return (ops$) =>
    pipe(
      ops$,
      tap((operation) => urqlEE.emit("urql-received-operation", operation)),
      forward,
      tap((result) => urqlEE.emit("urql-received-result", result))
    );
};

export default GqlDebug;
