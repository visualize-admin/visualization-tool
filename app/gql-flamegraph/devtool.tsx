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
  Theme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { scaleLinear } from "d3-scale";
import { OperationDefinitionNode } from "graphql";
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

const flattenTimings = (timings: Timings) => {
  const all: FlatTiming[] = [];
  visit(timings, (c, parents) => {
    if (c.start && c.end) {
      all.push({
        ...c,
        path: parents,
      } as unknown as FlatTiming);
    }
  });
  const sorted = all.sort((a, b) => (a.start < b.start ? -1 : 1));
  return sorted;
};

/**
 * Shows a SVG flamegraph for resolver field timings recorded on the
 * server
 */
const Flamegraph = ({
  timings,
}: {
  /** Sorted timings */
  timings: Timings;
}) => {
  const rects = useMemo(() => {
    const sorted = flattenTimings(timings);
    const begin = sorted[0].start;
    const end = sorted[sorted.length - 1].end;
    const scale = scaleLinear([begin, end], [0, 500]);

    const normalized = sorted.map((x) => ({
      ...x,
      start: scale(x.start),
      end: scale(x.end),
    }));
    return normalized;
  }, [timings]);

  const barHeight = 15;
  return (
    <>
      <Box sx={{ position: "relative", "& svg text": { fontSize: "10px" } }}>
        <svg width={900} height={50 + rects.length * barHeight}>
          <g>
            {rects.map((r, i) => (
              <Group left={r.start} top={i * barHeight} key={i}>
                <rect
                  x={0}
                  y={0}
                  height={barHeight}
                  width={r.end - r.start}
                  fill="#ccc"
                />
                <Text verticalAnchor="start" y={2}>
                  {`${Math.round(r.end - r.start)}ms - ${r.path.join(">")}
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

/**
 * Collapsible according showing for each request that has been made
 * a accordion with name
 */
const AccordionTimings = ({
  result,
  operation,
  start,
  end,
  ...accordionProps
}: {
  result: OperationResult | undefined;
  operation: Operation;
  start: number;
  end?: number;
} & Omit<AccordionProps, "children">) => {
  return (
    <Accordion {...accordionProps}>
      <AccordionSummary>
        <div>
          <Typography variant="body2" sx={{ mb: 0 }}>
            {operation.key}{" "}
            {
              operation.query.definitions.find(
                (d): d is OperationDefinitionNode =>
                  d.kind === "OperationDefinition"
              )?.name?.value
            }
            {result ? "✅" : "🔄"}
          </Typography>
          <Typography variant="caption">
            {new Date(start).toISOString().slice(11, 19)}
            {end ? `-${new Date(end).toISOString().slice(11, 19)}` : null}
          </Typography>
          <Box
            component="pre"
            maxWidth="100%"
            fontSize="small"
            whiteSpace="break-spaces"
            sx={{ my: 0 }}
          >
            {JSON.stringify(operation.variables, null, 0)}
          </Box>
        </div>
      </AccordionSummary>
      {accordionProps.expanded ? (
        <AccordionDetails>
          {result?.extensions?.timings ? (
            <Flamegraph timings={result.extensions.timings} />
          ) : null}
        </AccordionDetails>
      ) : null}
    </Accordion>
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

function GqlDebugDev() {
  const [operations, setOperations] = useState([] as Operation[]);
  const [results, setResults] = useState([] as OperationResult[]);
  const opsStartMapRef = useRef(new Map<Operation["key"], number>());
  const opsEndMapRef = useRef(new Map<Operation["key"], number>());
  useEffect(() => {
    const handleOperation = (operation: Operation) => {
      opsStartMapRef.current.set(operation.key, Date.now());
      opsEndMapRef.current.delete(operation.key);
      setTimeout(() => {
        setOperations((operations) =>
          uniqBy([...operations, operation], (op) => op.key)
        );
      }, 0);
    };
    const handleResult = (result: OperationResult) => {
      opsEndMapRef.current.set(result.operation.key, Date.now());
      setResults((results) =>
        uniqBy([...results, result], (x) => x.operation.key)
      );
      setOperations((operations) =>
        operations.filter((op) => result.operation.key !== op.key)
      );
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
    setOperations([]);
  });
  const { isOpen, open, close } = useDisclosure();
  const classes = useStyles();
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
            {sortBy(
              operations.filter(
                (o) => opsEndMapRef.current.get(o.key) === undefined
              ),
              (o) => opsStartMapRef.current.get(o.key)
            ).map((operation, i) => (
              <AccordionTimings
                key={i}
                result={undefined}
                operation={operation}
                expanded={expandedId === operation.key}
                start={opsStartMapRef.current.get(operation.key)!}
                end={opsEndMapRef.current.get(operation.key)!}
                onChange={(_e, expanded) =>
                  setExpandedId(expanded ? operation.key : undefined)
                }
              />
            ))}
            {sortBy(results, (r) => opsStartMapRef.current.get(r.operation.key))
              .filter((x) => x?.extensions?.timings)
              .map((result, i) => (
                <AccordionTimings
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

const GqlDebugProd = () => null;

const GqlDebug =
  process.env.NODE_ENV === "development" ? GqlDebugDev : GqlDebugProd;

/**
 * Used to communicate between urql and the flamegraph
 * component
 */
export const urqlEE = mitt<{
  "urql-received-operation": Operation<any, any>;
  "urql-received-result": OperationResult<any, any>;
}>();

export const gqlFlamegraphExchange: Exchange = ({ forward }) => {
  if (process.env.NODE_ENV === "production") {
    return (ops$) => forward(ops$);
  } else {
    return (ops$) =>
      pipe(
        ops$,
        tap((operation) =>
          // eslint-disable-next-line no-console
          urqlEE.emit("urql-received-operation", operation)
        ),
        forward,
        tap((result) =>
          // eslint-disable-next-line no-console
          urqlEE.emit("urql-received-result", result)
        )
      );
  }
};
export default GqlDebug;
