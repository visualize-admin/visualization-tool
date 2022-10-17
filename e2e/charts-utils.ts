import { Page } from "@playwright/test";

import { migrateChartConfig } from "../app/utils/chart-config/versioning";

export const loadChartInLocalStorage = async (
  page: Page,
  chartKey: string,
  config: any
) => {
  const lsKey = `vizualize-configurator-state:${chartKey}`;
  const lsValue = `${JSON.stringify(migrateChartConfig(config))}`;
  return page.addInitScript(
    `window.localStorage.setItem(\`${lsKey}\`, \`${lsValue}\`);`
  );
};
