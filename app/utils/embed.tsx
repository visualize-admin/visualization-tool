import { useRouter } from "next/router";
import React, { createContext, useContext, useMemo } from "react";

import useEvent from "@/utils/use-event";

export type EmbedOptions = {
  showMetadata?: boolean;
};

const EmbedOptionsContext = createContext([
  {} as EmbedOptions,
  (() => undefined) as (n: Partial<EmbedOptions>) => void,
] as const);

export const EmbedOptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
  return (
    <EmbedOptionsContext.Provider
      value={[embedOptions, setEmbedOptions] as const}
    >
      {children}
    </EmbedOptionsContext.Provider>
  );
};

export const useEmbedOptions = () => {
  return useContext(EmbedOptionsContext);
};
