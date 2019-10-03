import { markdown } from "catalog";

const chartBuilderMockups = [
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.1_l_chart-maker_step-1.1.png"
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.2_l_chart-maker_step-1.2.png"
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.3_l_chart-maker_step-1.3.png"
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.4_l_chart-maker_step-1.4_jahr.png"
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.5_l_chart-maker_step-1.5_messung.png"
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.6_l_chart-maker_step-1.6_kanton.png"
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.7_l_chart-maker_step-1.7_art.png"
  },
  {
    group: "Select Chart Type",
    src: "static/docs/design/mockups/1.3_l_chart-maker_step-2.png"
  },
  {
    group: "Customize Chart",
    src: "static/docs/design/mockups/1.4.1_l_chart-maker_step-3.1.png"
  },
  {
    group: "Customize Chart",
    src: "static/docs/design/mockups/1.4.2_l_chart-maker_step-3.2_filter.png"
  },
  {
    group: "Customize Chart",
    src:
      "static/docs/design/mockups/1.4.3_l_chart-maker_step-3.3_filter-interactive.png"
  },
  {
    group: "Annotate Chart",
    src: "static/docs/design/mockups/1.5.1_l_chart-maker_step-4.1.png"
  },
  {
    group: "Annotate Chart",
    src: "static/docs/design/mockups/1.5.2_l_chart-maker_step-4.2.png"
  },
  {
    group: "Annotate Chart",
    src: "static/docs/design/mockups/1.5.3_l_chart-maker_step-4.3.png"
  },
  {
    group: "Annotate Chart",
    src: "static/docs/design/mockups/1.5.4_l_chart-maker_step-4.4.png"
  },
  {
    group: "Annotate Chart",
    src: "static/docs/design/mockups/1.5.5_l_chart-maker_step-4.5.png"
  },
  {
    group: "Publish Chart",
    src: "static/docs/design/mockups/1.6_l_chart-maker_step-5.png"
  }
].reduce(
  (all, d) => {
    if (all[d.group]) {
      all[d.group].push(d);
    } else {
      all[d.group] = [d];
    }
    return all;
  },
  {} as Record<string, { group: string; src: string }[]>
);

export default () =>
  markdown`
> The design mockups illustrate an exemplary user flow through the _Visualization Tool_.

## Home and Gallery

The user's first contact with the _Visualization Tool_. In addition to a description of the tool and it's purpose, several entrypoints are available. A prominent call-to-action invites to go to the Visualization Builder directly. The gallery of recently created visualizations invites to just view them or create own visualizations based off of existing ones.

~~~image
plain: true
span: 3
src: "./static/docs/design/mockups/1.0_l_home.png"
description: "[Open full-size image](./static/docs/design/mockups/1.0_l_home.png)"
~~~

~~~image
plain: true
span: 3
src: "./static/docs/design/mockups/1.1_l_home_detail.png"
description: "[Open full-size image](./static/docs/design/mockups/1.1_l_home_detail.png)"
~~~

## Chart Builder

The Chart Builder is the core of the _Visualization Tool_. It guides the user through an easy to understand process from selecting the right dataset to customizing a visualization, and finally publishing it.

${Object.entries(chartBuilderMockups)
  .map(
    ([group, mockups]) =>
      `### ${group}
  ${mockups
    .map(
      mockup => `~~~image
plain: true
span: 3
src: "./${mockup.src}"
description: "[Open full-size image](./${mockup.src})"
~~~`
    )
    .join("\n")}
  `
  )
  .join("\n")}
  `;
