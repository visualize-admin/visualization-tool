import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Drawer,
  Grow,
  IconButton,
  IconButtonProps,
  Link,
  LinkProps,
  Tab,
  Typography,
} from "@mui/material";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { scaleLinear } from "d3-scale";
import { OperationDefinitionNode, print } from "graphql";
import maxBy from "lodash/maxBy";
import minBy from "lodash/minBy";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import mitt from "mitt";
import {
  ChangeEvent,
  Fragment,
  MouseEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Exchange, Operation, OperationResult } from "urql";
import { pipe, tap } from "wonka";

import { Switch } from "@/components/form";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { useDisclosure } from "@/components/use-disclosure";
import { flag, useFlag, useFlags } from "@/flags";
import { FlagName, FLAGS } from "@/flags/types";
import { RequestQueryMeta } from "@/graphql/query-meta";
import { Icon } from "@/icons";
import { useEvent } from "@/utils/use-event";

type Timings = Record<
  string,
  { start: number; end: number; children?: Timings }
>;

type VisualizeOperationResult<TData = any, TVariables = any> = Omit<
  OperationResult<TData, TVariables>,
  "extensions"
> & {
  extensions: {
    queries: RequestQueryMeta[];
    timings: Timings;
  };
};

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

const BAR_HEIGHT = 15;

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

  return (
    <Box
      sx={{
        position: "relative",
        "& svg text": { fontSize: "10px" },
      }}
    >
      <svg width={900} height={50 + rects.length * BAR_HEIGHT}>
        <g>
          {rects.map((r, i) => (
            <Group left={r.x0} top={i * BAR_HEIGHT} key={i}>
              <rect
                x={0}
                y={0}
                height={BAR_HEIGHT}
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
  );
};

const CopyLink = ({ toCopy, ...props }: { toCopy: string } & LinkProps) => {
  const { children, onClick, sx } = props;
  const [hasCopied, setHasCopied] = useState(false);
  const enhancedOnClick = useEvent((e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    navigator.clipboard.writeText(toCopy);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 1000);
  });

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

const getOperationQueryName = (operation: Operation) => {
  return operation.query.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === "OperationDefinition"
  )?.name?.value;
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
  maxTime,
  ...accordionProps
}: {
  result: VisualizeOperationResult | undefined;
  operation: Operation;
  start: number;
  end: number;
  maxTime: number;
} & Omit<AccordionProps, "children">) => {
  const duration = useMemo(() => {
    const all = result?.extensions?.timings
      ? flatten(result?.extensions?.timings).sort(byStart)
      : [];

    if (all.length === 0) {
      return 0;
    }

    return maxBy(all, (x) => x.end)?.end! - minBy(all, (x) => x.start)?.start!;
  }, [result?.extensions?.timings]);

  return (
    <Accordion {...accordionProps} data-testid="debug-panel-accordion">
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
            {getOperationQueryName(operation)}
          </Typography>
          <div style={{ marginTop: 4 }}>
            <svg width={100} height={10}>
              <rect
                x={0}
                y={0}
                width={(duration / maxTime) * 100}
                height={10}
                fill="#ccc"
              />
            </svg>
          </div>
          <Typography variant="caption">{duration}ms</Typography>
          <Link
            fontSize="small"
            whiteSpace="break-spaces"
            href={`/api/graphql?query=${encodeURIComponent(
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
              toCopy={JSON.stringify(operation.variables, null, 2)}
              onClick={(ev) => {
                ev.stopPropagation();
              }}
            >
              Copy variables
            </CopyLink>
          </span>
          <Typography variant="caption" display="inline">
            SPARQL queries ({result?.extensions?.queries.length})
          </Typography>
        </Box>
      </AccordionSummary>
      {accordionProps.expanded ? (
        <AccordionDetails>
          <div>
            <Typography variant="h5" gutterBottom>
              Variables
            </Typography>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {result?.operation.variables &&
                Object.entries(result.operation.variables).map(([k, v]) => {
                  return (
                    <Box key={k}>
                      <Typography variant="caption">
                        <b>{k}</b>: {JSON.stringify(v, null, 2)}
                      </Typography>
                    </Box>
                  );
                })}
            </div>
          </div>
          <Box sx={{ display: "grid", gridTemplateColumns: "40% 60%", mt: 2 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Typography variant="h5" gutterBottom>
                Resolvers
              </Typography>
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                {result?.extensions?.timings && (
                  <Flamegraph timings={flatten(result.extensions.timings)} />
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Typography variant="h5" gutterBottom>
                SPARQL queries ({result?.extensions?.queries.length})
              </Typography>
              <Queries
                queries={sortBy(result?.extensions.queries, (q) => {
                  return -(q.endTime - q.startTime);
                })}
              />
            </div>
          </Box>
        </AccordionDetails>
      ) : null}
    </Accordion>
  );
};

const Queries = ({ queries }: { queries: RequestQueryMeta[] }) => {
  return (
    <div>
      {queries.map((q, i) => {
        const text = q.text.replace(/\n\n/gm, "\n");
        return (
          <div key={i} style={{ overflowX: "auto" }}>
            <div>
              <Typography variant="caption">
                {q.endTime - q.startTime}ms
              </Typography>{" "}
              -{" "}
              <CopyLink toCopy={q.text} sx={{ fontSize: "small" }}>
                Copy
              </CopyLink>
            </div>
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
}: { children: ReactNode } & IconButtonProps) => {
  return (
    <IconButton
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 32,
        height: 32,
        mr: 2,
      }}
      {...props}
    >
      {children}
    </IconButton>
  );
};

const useGraphqlOperationsController = () => {
  const opsStartMapRef = useRef(new Map<Operation["key"], number>());
  const opsEndMapRef = useRef(new Map<Operation["key"], number>());
  useEffect(() => {
    const handleOperation = (operation: Operation) => {
      opsStartMapRef.current.set(operation.key, Date.now());
      opsEndMapRef.current.set(operation.key, Date.now());
    };
    const handleResult = (result: VisualizeOperationResult) => {
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
  const [results, setResults] = useState([] as VisualizeOperationResult[]);
  const handleReset = useEvent(() => {
    setResults([]);
  });

  return {
    opsStartMap: opsStartMapRef.current,
    opsEndMap: opsEndMapRef.current,
    reset: handleReset,
    results,
  };
};

type GraphqlOperationsController = ReturnType<
  typeof useGraphqlOperationsController
>;

function GqlDebug({ controller }: { controller: GraphqlOperationsController }) {
  const { opsStartMap, opsEndMap, reset, results } = controller;
  const [expandedId, setExpandedId] =
    useState<OperationResult["operation"]["key"]>();

  if (typeof window === "undefined") {
    return null;
  }

  const preparedResults = sortBy(results, (r) =>
    opsStartMap.get(r.operation.key)
  ).filter((x) => x?.extensions?.timings);
  const maxOperationTime = Math.max(
    ...preparedResults.map((r) => {
      const timings = flatten(r.extensions.timings);
      return Math.max(...timings.map((x) => x.end - x.start));
    })
  );

  return (
    <div>
      <Box>
        <Button variant="text" size="sm" onClick={reset}>
          Empty operations
        </Button>
      </Box>
      <Box sx={{ maxHeight: "500px" }}>
        {preparedResults.map((result, i) => (
          <AccordionOperation
            key={i}
            result={result}
            operation={result.operation}
            expanded={expandedId === result.operation.key}
            start={opsStartMap.get(result.operation.key)!}
            end={opsEndMap.get(result.operation.key)!}
            onChange={(_, expanded) =>
              setExpandedId(expanded ? result.operation.key : undefined)
            }
            maxTime={maxOperationTime}
          />
        ))}
      </Box>
    </div>
  );
}

/**
 * Used to communicate between urql and the flamegraph
 * component
 */
const urqlEE = mitt<{
  "urql-received-operation": Operation<any, any>;
  "urql-received-result": VisualizeOperationResult<any, any>;
}>();

/** @internal */
export const gqlFlamegraphExchange: Exchange = ({ forward }) => {
  return (ops$) =>
    pipe(
      ops$,
      tap((operation) => urqlEE.emit("urql-received-operation", operation)),
      forward,
      tap((result) =>
        urqlEE.emit("urql-received-result", result as VisualizeOperationResult)
      )
    );
};

export const DebugPanel = () => {
  const { isOpen, open, close } = useDisclosure();
  const [tab, setTab] = useState<"graphql" | "flags">("graphql");
  const gqlOperationsController = useGraphqlOperationsController();

  return (
    <>
      <Box sx={{ position: "fixed", bottom: 8, right: 8, zIndex: 10 }}>
        <Grow in>
          <IconButton data-testid="debug-panel-toggle" onClick={open}>
            🛠
          </IconButton>
        </Grow>
      </Box>
      <Drawer open={isOpen} anchor="bottom" elevation={2} onClose={close}>
        <TabContext value={tab}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TabList onChange={(_, tab) => setTab(tab)}>
              <Tab value="graphql" label="GraphQL" />
              <Tab value="flags" label="🚩 Flags" />
            </TabList>
            <EmojiIconButton onClick={close}>
              <Icon name="close" />
            </EmojiIconButton>
          </Box>
          <Divider />
          <TabPanel value="graphql">
            <GqlDebug controller={gqlOperationsController} />
          </TabPanel>
          <TabPanel value="flags">
            <FlagList />
          </TabPanel>
        </TabContext>
      </Drawer>
    </>
  );
};

const FlagList = () => {
  const flags = useFlags();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        columnGap: "1rem",
        rowGap: "0.5rem",
        alignItems: "center",
      }}
    >
      {flags.map((flag) => (
        <Fragment key={flag.name}>
          <Box sx={{ display: "flex" }}>
            <FlagSwitch flagName={flag.name as FlagName} />
          </Box>
          <Typography variant="body3" style={{ paddingLeft: "0.5rem" }}>
            {flag.description}
          </Typography>
        </Fragment>
      ))}
    </div>
  );
};

const FlagSwitch = ({ flagName }: { flagName: FlagName }) => {
  const flagValue = useFlag(flagName);
  const isTextFlag = useMemo(() => {
    return FLAGS.find((f) => f.name === flagName)?.type === "text";
  }, [flagName]);
  const handleChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    flag(flagName, e.target.checked);
  });

  return (
    <MaybeTooltip
      title={
        isTextFlag ? "This flag can only be set through the URL" : undefined
      }
    >
      <div>
        <Switch
          label={flagName.toUpperCase()}
          checked={!!flagValue}
          disabled={isTextFlag}
          onChange={handleChange}
        />
      </div>
    </MaybeTooltip>
  );
};
