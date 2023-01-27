import { useRouter } from "next/router";
import { useMemo } from "react";

import useEvent from "@/utils/use-event";

import { EmbedOptions } from "../components/chart-published";

export const useEmbedOptions = () => {
  const router = useRouter();
  const embedOptions = useMemo(() => {
    try {
      if (typeof router.query.embedOptions === "string") {
        return JSON.parse(router.query.embedOptions) as EmbedOptions;
      } else {
        return {};
      }
    } catch (e) {
      return {};
    }
  }, [router.query]);
  const setEmbedOptions = useEvent((patch: EmbedOptions) => {
    const newEmbedOptions: EmbedOptions = {
      ...embedOptions,
      ...patch,
    };
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        embedOptions: JSON.stringify(newEmbedOptions),
      },
    });
  });
  return [embedOptions, setEmbedOptions] as const;
};
