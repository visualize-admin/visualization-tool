import AxeBuilder from "@axe-core/playwright";
import { expect, Page } from "@playwright/test";

import { formatViolation, WCAG_TAGS } from "../app/test/axe-common";

export const expectNoAxeViolations = async ({
  page,
  include,
}: {
  page: Page;
  include?: string;
}) => {
  const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);

  if (include) {
    builder.include(include);
  }

  const { violations } = await builder.analyze();

  expect(violations.map(formatViolation)).toEqual([]);
};
