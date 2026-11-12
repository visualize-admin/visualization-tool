import axe from "axe-core";
import { expect } from "vitest";

import { formatViolation, WCAG_TAGS } from "@/test/axe-common";

export const expectNoAxeViolations = async (container: Element) => {
  const { violations } = await axe.run(container, {
    runOnly: { type: "tag", values: WCAG_TAGS },
    rules: {
      "color-contrast": { enabled: false },
    },
  });

  expect(violations.map(formatViolation)).toEqual([]);
};
