import { useEffect, useState } from "react";

import { flag } from "./flag";

type Flag =
  /** Whether we can search by termsets */
  | "search.termsets"
  /** Whether we can add dataset from shared dimensions */
  | "configurator.add-dataset.shared"
  /** Whether we can add a new dataset */
  | "configurator.add-dataset.new"
  /** Whether we can use the free canvas dashboard layout */
  | "layoutor.dashboard.free-canvas"
  /** Whether we can use shared filters on dashboard layout */
  | "layoutor.dashboard.shared-filters";

export default function useFlag(name: Flag) {
  const [flagValue, setFlag] = useState(() => flag(name));
  useEffect(() => {
    const handleChange = (changed: string) => {
      if (changed === name) {
        setFlag(flag(name));
      }
    };
    flag.store.ee.on("change", handleChange);
    return () => {
      flag.store.removeListener("change", handleChange);
    };
  }, [setFlag, name]);
  return flagValue;
}

export function useFlags() {
  const [flags, setFlags] = useState(flag.list());
  useEffect(() => {
    const handleChange = () => {
      setFlags(flag.list());
    };
    flag.store.ee.on("change", handleChange);
    return () => {
      flag.store.removeListener("change", handleChange);
    };
  }, [setFlags]);
  return flags;
}
