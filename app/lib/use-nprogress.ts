import { useRouter } from "next/router";
import NProgress from "nprogress";
import { useEffect } from "react";

/**
 * Add a NProgress loading bar for router navigation
 * @param config NProgress options
 *
 * Don't forget to include a global `nprogress.css` in _app.tsx!
 */
export const useNProgress = () => {
  const { events: routerEvents } = useRouter();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });
    const startProgress = (
      _routeName: string,
      options?: { shallow: boolean }
    ) => {
      if (options?.shallow) {
        return;
      }
      NProgress.start();
    };
    const stopProgress = () => NProgress.done();

    routerEvents.on("routeChangeStart", startProgress);
    routerEvents.on("routeChangeError", stopProgress);
    routerEvents.on("routeChangeComplete", stopProgress);
    return () => {
      routerEvents.off("routeChangeStart", startProgress);
      routerEvents.off("routeChangeError", stopProgress);
      routerEvents.off("routeChangeComplete", stopProgress);
    };
  }, [routerEvents]);
};
