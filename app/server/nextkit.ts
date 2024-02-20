import createAPI, { NextkitHandler } from "nextkit";

/** Provides type hints */
export const controller = <
  THandlers extends Record<string, NextkitHandler<null, unknown>>
>(
  methods: THandlers
) => {
  return methods;
};

export const api = createAPI({
  async onError(_req, _res, error) {
    return {
      status: 500,
      message: `Something went wrong: ${
        error instanceof Error ? error.message : error
      }`,
    };
  },
});
