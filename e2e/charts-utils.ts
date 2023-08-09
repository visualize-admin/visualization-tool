import { Page } from "@playwright/test";

export const loadChartInLocalStorage = async (
  page: Page,
  chartKey: string,
  config: any
) => {
  const lsKey = `vizualize-configurator-state:${chartKey}`;
  const lsValue = `${JSON.stringify(config)}`;
  return page.addInitScript(
    `window.localStorage.setItem(\`${lsKey}\`, \`${lsValue}\`);`
  );
};
