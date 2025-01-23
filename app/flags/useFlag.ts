import { useEffect, useState } from "react";

import { flag } from "./flag";
import { FlagName } from "./types";

export default function useFlagValue(name: FlagName) {
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
