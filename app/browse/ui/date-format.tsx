import { useMemo } from "react";

import { useFormatDate } from "@/formatters";

export const DateFormat = ({ date }: { date: string }) => {
  const formatter = useFormatDate();
  const formatted = useMemo(() => {
    return formatter(date);
  }, [formatter, date]);

  return <>{formatted}</>;
};
