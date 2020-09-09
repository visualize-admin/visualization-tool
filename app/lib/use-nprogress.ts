import NProgress from "nprogress";
import { useRouter } from "next/router";
import { useEffect } from "react";

/**
 * Add a NProgress loading bar for router navigation
 * @param config NProgress options
 *
 * Don't forget to include a global `nprogress.css` in _app.tsx!
 */
export const useNProgress = (
) => {
  const { events: routerEvents } = useRouter();

  useEffect(() => {
    NProgress.configure({showSpinner:false});
    const startProgress = () => NProgress.start();
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
