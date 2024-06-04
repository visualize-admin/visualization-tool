import { useEffect, useState } from "react";

import { FlagName } from "@/flags/store";

import { flag } from "./flag";

export default function useFlag(name: FlagName) {
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
