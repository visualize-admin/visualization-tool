# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

You can also check the [release page](https://github.com/visualize-admin/visualization-tool/releases)

## Unreleased

- Charts:
  - Enable sorting of Geo dimensions
  - Maintain segment sorting type correctly when switching from / to Pie chart
  - Fix sorting by measure when undefined values are present in the data

## [3.10.0] - 2022-10-19

- Improve loading performance for larger cubes

## [3.9.6] - 2022-10-12

- Fix: IRIs of NFI cubes (previously there was None-None- includes in IRI; it was removed recently and we now migrate old IRIs to new IRIs)

## [3.9.5] - 2022-10-04

- Charts: fix bugs that caused scatterplot and pie charts to crash in case no categorical dimensions were present in a dataset
- Embed: introduce chart config migrations to embed mode

## [3.9.4] - 2022-09-29

- Metadata: fix dimension metadata display for Grouped and Stacked column charts

## [3.9.3] - 2022-09-29

- Map: Retain filters when switching from another chart type to map
- Charts: Tooltip describing dimensions shown at more places.
- Search: Improvements concerning categories & themes.
- Metadata: Dimensions metadata is shown in more places within the UI

## [3.9.2] - 2022-09-20

- Map: fix a layer offset problem on Windows Edge.
- Search: Cubes without description were not returned

## [3.9.0] - 2022-09-19

### Features

- Dataset preview and chart edition: tooltips displaying dimension description are shown

### Fixes

- Search: improve response times
- Maps: Lakes are above dataviz layer

## [3.8.0] - 2022-09-15

- Search
  - Improve search time
  - Input value is kept when URL is shared
- Added migrations of chart configs (breaking changes to schema will not break existing charts)
- Tech
  - Diminish size of Javascript that is shipped to the client. Should improve page load performance
- Charts
  - Better formatting of numbers inside chart tooltips (for example for currencies)
- Filters
  - Initially, left filters are ordered so that dimension with hierarchy are at the top. Additionally, the topmost hierarchical value with a value is selected.
  - Color palette field has nicer UI

Note: We will try in the future to better follow semantic versioning.

## [3.7.11] - 2022-09-09

- 🚀 Maps
  - Symbols can now be colored according to a measure
  - Tilting /rotating is disabled
- 🐛 Hierarchies: Fixes, better order in the left filters when there are multiple roots
- 🐛 Table view: bug fix when switching from chart view on published view

## [3.7.10] - 2022-08-26

- Font adjustment in filters menu

## [3.7.9] - 2022-08-25

- Column order is based on the shacl:order defined in the data
  - For the dataset preview
  - For the table chart columns
- Default state for area chart uses the hierarchy and selects
  bottommost children
- Add cube checker to docs
- Font alignments with design
- Table config uses data column order to order columns
- Search handles wildcards ("bath" returns "bathing site" results)
- Currencies are better handled
- Add landing page link to chart footnotes
- Reintroduce chart selector panel section (additionally to popup on future tab)

## [3.7.8] - 2022-08-22

- Fixed organization search
- Explanation on how to create groups for tables
- Fixed delay in setting datasource

## [3.7.7] - 2022-08-17

- Add an option to see cubes from different LINDAS environments within one Visualize instance
- Store data source in charts' configs
- Improvement to hierarchy handling
  - See hierarchies in left filters
  - See hierarchies in the legend
  - Selection of values as part of segmentation now supports search and has been redesigned for clarity
- Improvements to default selection of values for segmentation
  - Only 7 values
- Legend symbols: squares (instead of lines) are used for pie / area / columns bar
- Ability to lock a map to the current viewed bounding box

## [3.7.4] - 2022-05-31

- Do not show "Run SPARQL query" button if SPARL_EDITOR variable not set
- Add link top opendata.swiss when the cube is published there (chart footnotes + chart preview info panel)
- Repair homepage examples on test

## [3.7.2] - 2022-05-24

- Support for filtering values from a dimension with monthly data (fix #564)

## [3.7.1] - 2022-05-23

- Fix page jump when switching from chart to table (published and editing mode)

## [3.7.0] - 2022-05-05

- Maps: Use neutral map style
- Interactive filters: time brush is more stable
- Tables: Column names contain unit if its there by @ptbrowne in #552
- Tables: Support for monthtly period formatting
- Tables: Bar chart in cells are fixed
- Navigation: Back button in editor 1st screen brings back to dataset preview
- Add status page link in the footer

## [3.6.3] - 2022-05-05

- Maps symbols are shown over all layers

## [3.6.2] - 2022-04-26

- Polished data download UI
- Ability to switch to table view on any chart
- Fixed scrolling of table preview & other smaller UI things in published charts
- Only the top 7 nav items are shown in the search nav bar (design alignment), a button is there to display more
- Added the footer in the search page
- Maps chloropleth are shown under map labels. Maps symbols are shown over most map features. When zooming via the buttons, we now have a smooth transition
- Removed chart selection step; selection of a chart type can now be done at any point when creating a chart (added a new chart selection tabs UI)
- Implemented logic to keep as much chart configuration as possible when switching chart type

## [3.4.10] - 2022-04-11

- Search improvements (handles trailing space and casing)
- Data download improvements (new UI with an ability to select XLSX file format)
- Raw data preview from the chart level
- Fixed parsing of xsd:gYearMonth timeFormat in TemporalDimension
- Updated date formatting for the Month timeUnit to be more user-friendly
- Changed pie chart legend symbol from line to square
- Migration to MUI

## [3.4.7] - 2022-02-18

- Search has been improved https://github.com/visualize-admin/visualization-tool/pull/256
  - Better support for acronyms
  - Less fuzzy search
  - Ability to search inside creator, themes, keywords

## [3.4.5] - 2022-02-25

- Switch to a global vector tile service for the maps
- Do not allow numerical dimensions in the options fields
- Fix wrong contrast for text and background color in tooltip for symbols (maps)
- Improve placement of tooltips and fix tooltips being cut
- Change example on homepage

## [3.4.4] - 2022-02-23

- Show unit and standard error inside map tooltip
- Prevent geo coordinates display error when all shapes on a map are deselected
- Show "-" inside a map tooltip when no value is present

## [3.4.2] - 2022-02-21

- Hide all elements related to labels, not only text by @bprusinowski in https://github.com/visualize-admin/visualization-tool/pull/387
- Do not set automatically empty filters by @ptbrowne in https://github.com/visualize-admin/visualization-tool/pull/384
- Do not show standard error in possible filters by @ptbrowne in https://github.com/visualize-admin/visualization-tool/pull/395
- Fix search and drafts count by @ptbrowne in https://github.com/visualize-admin/visualization-tool/pull/396
- Map improvements by @bprusinowski in https://github.com/visualize-admin/visualization-tool/pull/397

## [3.4.0] - 2022-02-18

### Features

#### Navigation

- Page have improved titles now, depending on where you are on the application. Helpful when you have
  multiple tabs with visualize.admin or when you bookmark things. [#331](https://github.com/visualize-admin/visualization-tool/pull/331)
- Theme and organization navigation counts take into account the search field now. [#329](https://github.com/visualize-admin/visualization-tool/pull/329)
- Improved chart editing navigation [#337](https://github.com/visualize-admin/visualization-tool/pull/337)
- Improved chart publish action buttons [#337](https://github.com/visualize-admin/visualization-tool/pull/337)

#### Maps

- Implemented a new base layer which makes use of vector tiles [#351](https://github.com/visualize-admin/visualization-tool/pull/351)

#### Filters

- Improved cascading filters selection to ensure data is shown after filter selection [#343](https://github.com/visualize-admin/visualization-tool/pull/343)
- Improved initial filter selection to ensure data is shown on the selecting chart type step [#327](https://github.com/visualize-admin/visualization-tool/pull/327)

#### Standard error

- Standard errors are displayed automatically for column chart and grouped column chart. [#352](https://github.com/visualize-admin/visualization-tool/pull/352) [#356](https://github.com/visualize-admin/visualization-tool/pull/356)
- Tooltip for simple column chart contain the standard error. [#366](https://github.com/visualize-admin/visualization-tool/pull/366)

### Bugs

- Fix selection of optional date filter [#332](https://github.com/visualize-admin/visualization-tool/pull/332)
- Fix discrete color scales with less than 3 observations [#309](https://github.com/visualize-admin/visualization-tool/pull/309)

## [3.3.0] - 2022-02-07

### Maps

It is now possible to use maps as a new visualization type. Quantities can be encoded as a scatterplot on the map. Datasets which have GeoShapes or GeoCoordinates dimensions can be charted on a map.

[#294](https://github.com/visualize-admin/visualization-tool/pull/294) [#289](https://github.com/visualize-admin/visualization-tool/pull/289) [#292](https://github.com/visualize-admin/visualization-tool/pull/292) [#286](https://github.com/visualize-admin/visualization-tool/pull/286) [#240](https://github.com/visualize-admin/visualization-tool/pull/240) [#293](https://github.com/visualize-admin/visualization-tool/pull/293) [#301](https://github.com/visualize-admin/visualization-tool/pull/301) [#302](https://github.com/visualize-admin/visualization-tool/pull/302)

### Cascading filters

Now the left panel filters are cascading filters: values chosen for above filters will be taken into account for below filters. Also, optional filters are not shown at first but can be added via a menu.

[#271](https://github.com/visualize-admin/visualization-tool/pull/271)

### Misc

- Banner and icons have been removed on the homepage [#297](https://github.com/visualize-admin/visualization-tool/pull/297)
- Ordinal dimensions values are now sorted in various places (legend, right filters, tooltips) [#262](https://github.com/visualize-admin/visualization-tool/pull/262)
- Dataset loading errors have been improved [#304](https://github.com/visualize-admin/visualization-tool/pull/304)
- 🐛 By default, search results are sorted by relevance [#273](https://github.com/visualize-admin/visualization-tool/pull/273)
- A small description text is shown while browsing all datasets [#268](https://github.com/visualize-admin/visualization-tool/pull/268)
- Drag and drop is available on all the row, not only on the icon for table chart groups [#265](https://github.com/visualize-admin/visualization-tool/pull/265)
- _beta_ Hierarchical filters are available behind a flag on the "red list" dataset [#233](https://github.com/visualize-admin/visualization-tool/pull/233)
- 🐛 Links from openswissdata should work correctly [#303](https://github.com/visualize-admin/visualization-tool/pull/303) [#314](https://github.com/visualize-admin/visualization-tool/pull/314)

## [0.6.0] - 2020-05-25

### Added

- Option for sorting elements in charts (e.g. sorting column charts by value instead of alphabetically)
- Option for defining custom colors for individual values.

### Fixed

- Only allow temporal dimensions for line and area chart x-axis
- Only show scrollbars when necessary
- Show loading indicator in editor when data is reloading

## [0.5.2] – 2020-05-04

### Added

- To prevent search indexing of staging environments, the header `X-Robots-Tag` will be set to `noindex, nofollow` unless the env variable `ALLOW_SEARCH_BOTS=true` is set.

### Fixed

- Disabled compilation of dependencies in node_modules with Babel. This resolves some build issues.

## [0.5.1] – 2020-04-29

### Fixed

- Remove "none" from pie partition options
- Add a hint when negative values are used in the pie
- Fix number of time axis ticks in partitioned charts

## [0.5.0] - 2020-04-22

### Added

- Tooltips for all chart types
- Automated snapshot regression tests
- Static pages setup for imprint and legal pages
- Content for static pages
- Search and sort options in dataset selection step
- Pie chart type
- Home page and UI translations for all languages
- Make core app usable as npm package

### Changed

- Improved wording on home page
- Fetch configs directly from DB on server
- Improved "themeability" by refactoring component styles
- Refactor to use next.js `getServerSideProps` where applicable
- Enable CORS on GraphQL endpoint

### Fixed

- i18n: Set html lang attribute
- Handle single-measure temporal datasets
- Better date parsing (don't assume all dates are years)
- Improvements to responsive axis label rendering
- Viewport meta tag for AEM embeds
- Various QA fixes

## [0.4.0] - 2020-02-12

### Added

- GraphQL API: Move all SPARQL/Data Cube fetching and transformation logic behind a GraphQL API
- "Copy Visualization" feature

### Changed

- Remove dependency on [vega](https://vega.github.io/vega/) and replace with custom React + D3 charts

### Removed

- Remote Data logic, SWR (both replaced by GraphQL)

## [0.3.0]

TODO
