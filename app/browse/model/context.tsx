import { createContext, ReactNode, useContext, useState } from "react";

import { createUseBrowseState } from "@/browse/lib/create-use-state";

export type BrowseState = ReturnType<ReturnType<typeof createUseBrowseState>>;
const BrowseContext = createContext<BrowseState | undefined>(undefined);

const useBrowseState = ({ syncWithUrl }: { syncWithUrl: boolean }) => {
  // Use useState here to make sure that the hook is only created once.
  // /!\ It will not react if syncWithUrl changes
  const [useBrowseStateHook] = useState(() => {
    return createUseBrowseState({ syncWithUrl });
  });

  return useBrowseStateHook();
};

/**
 * Provides browse context to children below
 * Responsible for connecting the router to the browsing state
 */
export const BrowseStateProvider = ({
  children,
  syncWithUrl,
}: {
  children: ReactNode;
  syncWithUrl: boolean;
}) => {
  const browseState = useBrowseState({ syncWithUrl });

  return (
    <BrowseContext.Provider value={browseState}>
      {children}
    </BrowseContext.Provider>
  );
};

export const useBrowseContext = () => {
  const ctx = useContext(BrowseContext);

  if (!ctx) {
    throw Error(
      "To be able useBrowseContext, you must wrap it into a BrowseStateProvider"
    );
  }

  return ctx;
};
