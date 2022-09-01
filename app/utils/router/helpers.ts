import { NextRouter } from "next/router";

import { isRunningInBrowser } from "../is-running-in-browser";

export const getURLParam = (param: string) => {
  const url = isRunningInBrowser() ? new URL(window.location.href) : null;
  if (!url) {
    return undefined;
  }
  return url.searchParams.get(param);
};

export const updateRouterQuery = (
  { pathname, replace, query }: NextRouter,
  values: { [k: string]: string }
) => {
  replace({ pathname, query: { ...query, ...values } }, undefined, {
    shallow: true,
  });
};

export const setURLParam = (param: string, value: string) => {
  const qs = new URL(window.location.href).searchParams;
  qs.delete(param);
  qs.append(param, value);
  const newUrl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    `?${qs.toString()}`;
  window.history.replaceState({ path: newUrl }, "", newUrl);
};
