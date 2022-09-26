import { Resolver, Resolvers } from "@apollo/client/core";
import { GraphQLResolveInfo } from "graphql";

type Timing = {
  start: number;
  end: number;
};

const timed = <T extends unknown[]>(
  fn: Function,
  cb: ({ start, end }: Timing, ...args: T) => void
) => {
  const wrapped: Function = async function (...args: T) {
    const start = Date.now();
    const res = await fn(...args);
    const end = Date.now();
    cb({ start, end }, ...args);
    return res;
  };
  return wrapped;
};

export type Timings = Record<
  string,
  { start: number; end: number; children?: Timings }
>;

const getPathFromInfo = (info: GraphQLResolveInfo) => {
  const path = [];
  let cur = info.path as GraphQLResolveInfo["path"] | undefined;
  while (cur) {
    path.push(cur);
    cur = cur.prev;
  }
  path.reverse();
  return path;
};

const setTimingInContext = (
  ctx: any,
  path: GraphQLResolveInfo["path"][],
  timing: Timing
) => {
  ctx.timings = ctx.timings || { children: {} };
  let cur = ctx.timings;

  for (let i = 0; i < path.length; i++) {
    const item = path[i];
    cur.children[item.key] = cur.children[item.key] || { children: {} };
    cur = cur.children[item.key];
  }

  Object.assign(cur, timing);
};

/**
 * Modifies in place the resolvers so that they console log their
 * duration if it exceeds threshold.
 */
export const setupFlamegraph = (resolvers: Resolvers, threshold = 250) => {
  for (const [type, typeResolvers] of Object.entries(resolvers)) {
    if (typeof typeResolvers === "object") {
      for (const [field, fieldResolver] of Object.entries(typeResolvers)) {
        if (
          typeof fieldResolver === "function" &&
          fieldResolver.constructor.name === "AsyncFunction"
        ) {
          typeResolvers[field] = timed(
            fieldResolver as Resolver,
            (timing, ...resolverArgs: Parameters<Resolver>) => {
              const [root, args, context, info] = resolverArgs;
              const path = info
                ? getPathFromInfo(info as unknown as GraphQLResolveInfo)
                : [];
              setTimingInContext(context, path, timing);
            }
          ) as Resolver;
        }
      }
    }
  }
};
