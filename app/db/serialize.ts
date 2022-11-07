import SuperJSON from "superjson";
import { SuperJSONResult } from "superjson/dist/types";

export type Serialized<P> = P & {
  _superjson?: ReturnType<typeof SuperJSON.serialize>["meta"];
};

export const serializeProps = <T extends unknown>(props: T) => {
  const { json: sprops, meta } = SuperJSON.serialize(props);
  if (meta) {
    // @ts-ignore
    sprops._superjson = meta;
  }
  return sprops as Serialized<typeof props>;
};

type Deserialized<T> = T extends Serialized<infer S> ? S : never;

export const deserializeProps = <T extends Serialized<unknown>>(sprops: T) => {
  const { _superjson, ...props } = sprops;
  return SuperJSON.deserialize({
    json: props,
    meta: _superjson,
  } as unknown as SuperJSONResult) as Deserialized<T>;
};
