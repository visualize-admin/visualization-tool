import { useEffect, useState } from "react";

import { flag } from "@/flags/flag";
import { FlagName } from "@/flags/types";

export const useFlag = (name: FlagName) => {
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
};

export const useFlags = () => {
  const [flags, setFlags] = useState(() => {
    flag.removeDeprecated();
    return flag.list();
  });

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
};
