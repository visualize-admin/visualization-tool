import { markdown } from "catalog";

const chartBuilderMockups = [
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.1_l_chart-maker_step-1.1.png",
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.2_l_chart-maker_step-1.2.png",
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.3_l_chart-maker_step-1.3.png",
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.4_l_chart-maker_step-1.4_jahr.png",
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.5_l_chart-maker_step-1.5_messung.png",
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.6_l_chart-maker_step-1.6_kanton.png",
  },
  {
    group: "Select and Filter Dataset",
    src: "static/docs/design/mockups/1.2.7_l_chart-maker_step-1.7_art.png",
  },
  {
    group: "Select Chart Type",
    src: "static/docs/design/mockups/1.3_l_chart-maker_step-2.png",
  },
  {
    group: "Customize Chart",
    src: "static/docs/design/mockups/1.4.1_l_chart-maker_step-3.1.png",
  },
  {
    group: "Customize Chart",
    src: "static/docs/design/mockups/1.4.2_l_chart-maker_step-3.2_filter.png",
  },
  {
    group: "Customize Chart",
    src: "static/docs/design/mockups/1.4.3_l_chart-maker_step-3.3_filter-interactive.png",
  },
  {
    group: "Annotate Chart",
    src: "static/docs/design/mockups/1.5.1_l_chart-maker_step-4.1.png",
  },
  {
    group: "Annotate Chart",
    src: "static/docs/design/mockups/1.5.2_l_chart-maker_step-4.2.png",
  },
  {
    group: "Annotate Chart",
    src: "static/docs/design/mockups/1.5.3_l_chart-maker_step-4.3.png",
  },
  {
    group: "Annotate Chart",
    src: "static/docs/design/mockups/1.5.4_l_chart-maker_step-4.4.png",
  },
  {
    group: "Annotate Chart",
    src: "static/docs/design/mockups/1.5.5_l_chart-maker_step-4.5.png",
  },
  {
    group: "Publish Chart",
    src: "static/docs/design/mockups/1.6_l_chart-maker_step-5.png",
  },
].reduce((all, d) => {
  if (all[d.group]) {
    all[d.group].push(d);
  } else {
    all[d.group] = [d];
  }
  return all;
}, {} as Record<string, { group: string; src: string }[]>);

const Doc = () =>
  markdown`
> The design mockups illustrate an exemplary user flow through _Visualize_.

## Home

The user's first contact with _Visualize_. In addition to a description of the tool and it's purpose, several entrypoints are available. A prominent call-to-action invites to go to the Chart Builder directly.

The homepage includes a short tutorial section that describies the different steps needed to create a visualization, as well as some example charts that explain different features of the charts created with the tool and which invite the users to create their own visualizations based on the examples. The examples are followed by a section about which kind of data is available via _Visualize_, followed by a call-to-action for other potential data-providers.

~~~image
plain: true
span: 3
src: "./static/docs/design/mockups/1.0_l_home.png"
description: "[Open full-size image](./static/docs/design/mockups/1.0_l_home.png)"
~~~

~~~image
plain: true
span: 1
src: "./static/docs/design/mockups/1.0_s_home.png"
description: "[Open full-size image](./static/docs/design/mockups/1.0_s_home.png)"
~~~

As the Chart builder is not optimized for mobile use-case, a user trying to access the Chart Builder using a mobile device, will be presented with the following warning.

~~~image
plain: true
span: 1
src: "./static/docs/design/mockups/1.1_s_chart-maker_error-mobile.png"
description: "[Open full-size image](./static/docs/design/mockups/1.1_s_chart-maker_error-mobile.png)"
~~~

## Chart Landing Page

Each chart built with _Visualize_ is assignened a dedicated Chart-URL. As soon as a chart has been published, a dedicated «Landing Page» can be accessed by anyone using the appropriate URL. This page should also be made available on mobile devices (responisve design).

The landing page includes the chart itself, as well as the header & footer of _Visualize_ and a set of dedicated actions such as image download, sharing, or embedding. At the bottom of the page, the user is presented with the option to create a new visualization from scratch.

~~~image
plain: true
span: 3
src: "./static/docs/design/mockups/1.8.1_l_shared_page.png"
description: "[Open full-size image](./static/docs/design/mockups/1.8.1_l_shared_page.png)"
~~~

~~~image
plain: true
span: 3
src: "./static/docs/design/mockups/1.8.2_l_shared_page.png"
description: "[Open full-size image](./static/docs/design/mockups/1.8.2_l_shared_page.png)"
~~~

~~~image
plain: true
span: 3
src: "./static/docs/design/mockups/1.8.3_l_shared_page.png"
description: "[Open full-size image](./static/docs/design/mockups/1.8.3_l_shared_page.png)"
~~~

~~~image
plain: true
span: 3
src: "./static/docs/design/mockups/1.8.4_l_shared_page.png"
description: "[Open full-size image](./static/docs/design/mockups/1.8.4_l_shared_page.png)"
~~~

~~~image
plain: true
span: 1
src: "./static/docs/design/mockups/1.8.1_s_shared_page.png"
description: "[Open full-size image](./static/docs/design/mockups/1.8.1_s_shared_page.png)"
~~~

~~~image
plain: true
span: 1
src: "./static/docs/design/mockups/1.8.3_s_shared_page.png"
description: "[Open full-size image](./static/docs/design/mockups/1.8.3_s_shared_page.png)"
~~~


## Chart Builder

The Chart Builder is the core of _Visualize_. It guides the user through an easy to understand process from selecting the right dataset to customizing a visualization, and finally publishing it.

${Object.entries(chartBuilderMockups)
  .map(
    ([group, mockups]) =>
      `### ${group}
  ${mockups
    .map(
      (mockup) => `~~~image
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

export default Doc;
