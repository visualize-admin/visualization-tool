import { ImageSpecimen, markdown, TableSpecimen } from "catalog";

const Doc = () => markdown`

## Content
1. [Chart Configuration Interface](#1-chart-configuration-interface)
1.1 [Chart configuration panel](#11-chart-configuration-panel)
1.2 [Visualization preview panel](#12-visualization-panel)
1.3 [Data filter panel](#13-data-filter-panel)
2. [Mockups](#2-mockups)
2.1 [Bar Chart](#21-bar-chart)
2.2 [Column Chart](#22-column-chart)
2.3 [Line Chart](#23-line-chart)
2.4 [Area Chart](#24-area-chart)
2.5 [Scatterplot](#25-scatterplot)


# 1. Chart Configuration Interface
The configuration interface is divided in 3 panels:
- The _chart configuration_ panel on the left is used to select chart parameters, the visual encodings of the dataset dimensions.
- The _visualzation preview_ panel in the middle offers an interactive preview of the chart.
- The _data filtering_ panel on the right allows to filter the data points being displayed on the chart.
${(
  <ImageSpecimen
    plain={true}
    span={4}
    src="./static/docs/design/chart-config/flow-general.png"
  />
)}

## 1.1 Chart configuration panel

### Chart elements: x-axis, y-axis, segment, etc.
After a user has selected a dataset and a chart type, the chart configuration panel is updated so that the configuration options match the chart elements of the selected chart type. Some parameters are mandatory. For instance, a column chart requires at least two chart elements to be defined: the horizontal axis and the vertical axis. The other parameters are optional.

### Dataset dimensions: categories, numbers, time, etc.
The options available to select for each chart element are based on the dimension types defined in the dataset metadata. For instance, colors of a line chart needs to be defined by a dimension that can create groups (for instance: cantons). Visualize tries to select default parameters that should work (for instance, a temporal dimension for the horizontal axis of a line chart). Of course, the user has the power to modify all options.

### Additional parameters
Depending on the chart type selected, additional options are available for selection and influence the visualization. Some optional parameter will modify the chart type selected, for instance, defining a data dimension that controls segments in a column chart will convert it into a _stacked_ column chart. Other parameters don’t directly influence the chart type, but modify the view of the dataset, like sorting the columns of a column chart for instance.

### Mapping between chart types and dataset dimensions
Whether a chart element is defined or not controls the visualization. In the table below is a non exhaustive list of some of the configuration combinations that we consider. For more information about how the dimension types are defined, see the Components / RDF to Visualize section.

${(
  <TableSpecimen
    span={5}
    rows={[
      {
        "Chart type": "**area**",
        "x-axis": "time",
        "y-axis": "number",
        color: "ø",
        group: "ø",
      },
      {
        "Chart type": "**stacked area**",
        "x-axis": "time",
        "y-axis": "number",
        color: "category | ordinal time",
        group: "ø",
      },
      {
        "Chart type": "**column**",
        "x-axis": "category | (ordinal) time",
        "y-axis": "number",
        color: "ø",
        group: "ø",
      },
      {
        "Chart type": "**stacked column**",
        "x-axis": "category | (ordinal) time",
        "y-axis": "number",
        color: "category | ordinal time",
        group: "ø",
      },
      {
        "Chart type": "**grouped column**",
        "x-axis": "category | (ordinal) time",
        "y-axis": "number",
        color: "ø",
        group: "category | ordinal time",
      },
      {
        "Chart type": "**line**",
        "x-axis": "time",
        "y-axis": "number",
        color: "ø",
        group: "ø",
      },
      {
        "Chart type": "**multi-line**",
        "x-axis": "time",
        "y-axis": "number",
        color: "category | ordinal time",
        group: "ø",
      },
      {
        "Chart type": "**map**",
        "x-axis": "geo",
        "y-axis": "number",
        color: "number | category (ordinal measure) | ordinal time",
        group: "ø",
      },
      {
        "Chart type": "**pie**",
        "x-axis": "ø",
        "y-axis": "number",
        color: "category | ordinal time",
        group: "ø",
      },
      {
        "Chart type": "**scatterplot**",
        "x-axis": "number",
        "y-axis": "number",
        color: "category | ordinal time",
        group: "ø",
      },
    ]}
  />
)}

## 1.2 Visualization panel

This panel displays an interactive preview of the data visualization.

## 1.3 Data filter panel

The right panel is used to filter the data points to display on the chart. For each data dimension, the dimension values are listed (“Zürich” or “Vaud” are dimension values of the dimension “Canton” for instance). They can be toggled in or out of the chart.

# 2. Mockups
> These mockups illustrate the different configuration options for each of the chart-types available.

## 2.1 Bar-Chart

A bar chart encodes quantitative values as the extent of rectangular bars.

${(
  <ImageSpecimen
    plain={true}
    span={3}
    src="./static/docs/design/chart-config/2.1.1_l_configuration_bar-chart.png"
    description="[Default Bar-Chart](./static/docs/design/chart-config/2.1.1_l_configuration_bar-chart.png)"
  />
)}

${(
  <ImageSpecimen
    plain={true}
    span={3}
    src="./static/docs/design/chart-config/2.1.2_l_configuration_bar-chart_stacked.png"
    description="[Stacked Bar-Chart](./static/docs/design/chart-config/2.1.2_l_configuration_bar-chart_stacked.png)"
  />
)}

## 2.2 Column-Chart

The column chart or vertical bar chart is the same as a bar chart only the x-axis and y-axis are switched.

A «stacked» column or bar charts is multiple datasets on top of each other in order to show how the larger category is divided into the smaller categories and their relations to the total amount.
Basically, they can be divided into two types:

- A stacked column or bar chart displays total value of the bar is all the segment values added together.
- A normalized (100%) stacked column or bar chart displays part to whole relationship in each group.

${(
  <ImageSpecimen
    plain={true}
    span={3}
    src="./static/docs/design/chart-config/2.2.1_l_configuration_column-chart.png"
    description="[Default Column-Chart](./static/docs/design/chart-config/2.2.1_l_configuration_column-chart.png)"
  />
)}

${(
  <ImageSpecimen
    plain={true}
    span={3}
    src="./static/docs/design/chart-config/2.2.2_l_configuration_column-chart_stacked.png"
    description="[Stacked Column-Chart](./static/docs/design/chart-config/2.2.2_l_configuration_column-chart_stacked.png)"
  />
)}

${(
  <ImageSpecimen
    plain={true}
    src="./static/docs/design/chart-config/2.2.3_l_configuration_column-chart_stacked.png"
    span={3}
    description="[Normalized (Percentage) Column-Chart](./static/docs/design/chart-config/2.2.3_l_configuration_column-chart_stacked.png)"
  />
)}

${(
  <ImageSpecimen
    plain={true}
    span={3}
    src="./static/docs/design/chart-config/2.2.4_l_configuration_column-chart_grouped.png"
    description="[Grouped Column-Chart](./static/docs/design/chart-config/2.2.4_l_configuration_column-chart_grouped.png)"
  />
)}

## 2.3 Line-Chart

A line chart is a type of chart which displays information as a series of data points (e.g. time) connected by a line.

${(
  <ImageSpecimen
    plain={true}
    span={3}
    src="./static/docs/design/chart-config/2.3.1_l_configuration_line-chart.png"
    description="[Default Line-Chart](./static/docs/design/chart-config/2.3.1_l_configuration_line-chart.png)"
  />
)}

${(
  <ImageSpecimen
    plain={true}
    span={3}
    src="./static/docs/design/chart-config/2.3.2_l_configuration_line-chart_multi-line.png"
    description="[Multi-Line Chart](./static/docs/design/chart-config/2.3.2_l_configuration_line-chart_multi-line.png)"
  />
)}

## 2.4 Area-Chart

An area chart or area graph are basically a line chart with the area below the lined filled with colors or textures. Like line graphs area charts are used to represent the development of quantitative values over a time period. It can also be used to compare two or more categories and is similar to the stacked area chart.

${(
  <ImageSpecimen
    plain={true}
    span={3}
    src="./static/docs/design/chart-config/2.4.1_l_configuration_area.png"
    description="[Default Area-Chart](./static/docs/design/chart-config/2.4.1_l_configuration_area.png)"
  />
)}

${(
  <ImageSpecimen
    plain={true}
    span={3}
    src="./static/docs/design/chart-config/2.4.2_l_configuration_area-chart_stacked.png"
    description="[Stacked Area-Chart](./static/docs/design/chart-config/2.4.2_l_configuration_area-chart_stacked.png)"
  />
)}

## 2.5 Scatterplot

A scatter plot uses cartesian coordinates to display values for two variables for a set of data. The data is displayed as a collection of points, each having the value of one variable determining the position on the horizontal axis and the value of the other variable determining the position on the vertical axis.

${(
  <ImageSpecimen
    plain={true}
    span={3}
    src="./static/docs/design/chart-config/2.5.1_l_configuration_scatterplot.png"
    description="[Default Scatterplot](./static/docs/design/chart-config/2.5.1_l_configuration_scatterplot.png)"
  />
)}

${(
  <ImageSpecimen
    plain={true}
    span={3}
    src="./static/docs/design/chart-config/2.5.2_l_configuration_scatterplot_grouped.png"
    description="[Grouped Scatterplot](./static/docs/design/chart-config/2.5.2_l_configuration_scatterplot_grouped.png)"
  />
)}
`;

export default Doc;
