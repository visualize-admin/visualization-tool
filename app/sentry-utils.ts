import { IS_VERCEL, PUBLIC_URL } from "./domain/env";

/** Returns one of the `test`, `int` or `prod` environments.
 *
 * If the environment is not recognized, it returns `undefined`,
 * which means we will default to automatically detecting the environment.
 * In the case of Vercel deployments, the behavior is described here:
 * https://github.com/getsentry/sentry-javascript/blob/develop/packages/nextjs/src/common/getVercelEnv.ts
 */
export const getSentryEnv = () => {
  switch (PUBLIC_URL) {
    case "https://dev.visualize.admin.ch/": {
      return "test";
    }
    case "https://int.visualize.admin.ch/": {
      return "int";
    }
    case "https://visualize.admin.ch/": {
      return "prod";
    }
    default:
      if (IS_VERCEL) {
        return "vercel";
      }
  }
};
