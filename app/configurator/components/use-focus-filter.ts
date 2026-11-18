import { useEffect, useState } from "react";

import { useEvent } from "@/utils/use-event";

const FILTER_CARD_ID_ATTRIBUTE = "data-filter-card-id";

const FILTER_CONTROL_SELECTOR =
  '[role="combobox"], [aria-haspopup="dialog"], input:not([type="checkbox"]):not([aria-hidden="true"])';

/** Moves focus to the control of a filter card once it has rendered, e.g. after adding it. */
export const useFocusFilter = () => {
  const [pendingId, setPendingId] = useState<string>();

  useEffect(() => {
    if (!pendingId) {
      return;
    }

    const element = Array.from(
      document.querySelectorAll(`[${FILTER_CARD_ID_ATTRIBUTE}]`)
    )
      .find((card) => card.getAttribute(FILTER_CARD_ID_ATTRIBUTE) === pendingId)
      ?.querySelector<HTMLElement>(FILTER_CONTROL_SELECTOR);

    element?.focus();
    setPendingId(undefined);
  }, [pendingId]);

  return useEvent((id: string) => {
    setPendingId(id);
  });
};

/** Marks the element that holds a filter's controls, so `useFocusFilter` can find it. */
export const getFilterCardProps = (id: string) => {
  return { [FILTER_CARD_ID_ATTRIBUTE]: id };
};
