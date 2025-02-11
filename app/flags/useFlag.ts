import qs from "qs";
import { useEffect, useState } from "react";

import { useKeyboardShortcut } from "@/utils/use-keyboard-shortcuts";

import { flag, FLAG_PREFIX } from "./flag";
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

export const useDebugShortcut = (enable?: boolean) => {
  useKeyboardShortcut(
    {
      keys: ["t", "d"],
      ctrlKey: true,
    },
    (event) => {
      event.preventDefault();
      enable && addDebugFlag();
    }
  );
};

const addDebugFlag = () => {
  const currentUrl = new URL(window.location.href);
  const currentParams = qs.parse(currentUrl.search.substring(1));

  const debugFlagKey = `${FLAG_PREFIX}debug`;
  const hasDebugFlag = currentParams[debugFlagKey] === "true";

  if (hasDebugFlag) {
    delete currentParams[debugFlagKey];
  } else {
    currentParams[debugFlagKey] = "true";
  }

  const newSearch = qs.stringify(currentParams);
  const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;
  window.history.pushState({}, "", newUrl);

  const event = new Event("popstate");
  window.dispatchEvent(event);
};
