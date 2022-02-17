export type Has<T extends unknown, R extends string> = T extends {
  [k in R]: any;
}
  ? T
  : never;
