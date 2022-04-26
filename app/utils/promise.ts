export type PromiseValue<T> = T extends Promise<infer S> ? S : T;
