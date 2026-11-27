import { useMemo } from "react";

export const useStableIds = (ids: string[]) => {
  const key = ids.join("\n");

  return useMemo(() => (key ? key.split("\n") : []), [key]);
};
