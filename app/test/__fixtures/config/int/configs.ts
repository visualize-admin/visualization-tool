import { TestConfig } from "../types";

const configs: TestConfig[] = [
  // Deactivate the test since the query timeouts right now 26.04.2022
  // {
  //   chartId: "nQckT-nFEQe4",
  //   name: "Column - Red list",
  //   slug: "column-red-list",
  // },
  {
    chartId: "rOAYJqoZQKlU",
    name: "Column - Heavy metals",
    slug: "column-heavy-metals",
  },
  {
    chartId: "cfNkIaMvN_xL",
    name: "Scatterplot - Palmer Penguins",
    slug: "scatterplot-palmer-penguins",
  },
  // {
  //   chartId: "clQmsblRxpK7",
  //   name: "Column - Waldfläsche (standard error bars)",
  //   slug: "column-waldflasche",
  // },
  {
    chartId: "I0KucujlOLgb",
    name: "Line - State accounts (segmented)",
    slug: "line-state-accounts",
  },
  {
    chartId: "Z6Re21LHbOoP",
    name: "Pie - Red list",
    slug: "pie-red-list",
  },
  {
    chartId: "jky5IEw6poT3",
    name: "Map - NFI: Topics by tree status",
    slug: "map-nfi",
  },
  {
    chartId: "nI6X4V_EcK2c",
    name: "Bathing water quality (interactive filters hierarchie)",
    slug: "bathing-water-quality-hierarchie",
  },
];

export default configs;
