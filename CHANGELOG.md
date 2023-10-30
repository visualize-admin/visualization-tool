# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

You can also check the [release page](https://github.com/visualize-admin/visualization-tool/releases)

## Unreleased

- Features
  - It's now possible to adjust Combo charts colors 🧑‍🎨
  - Subthemes are now displayed even when organization section is the second one (Browse page)
- Fixes
  - Color picker in now in sync with selected color palette
  - Dataset counts should now be correct in all cases
  - Dataset tags now wrap
  - It's now possible to de-select only one filter when both themes and organizations are filtered (Browse page)
  - Search string is now correctly persisted in search box when refreshing the page (Browse page)
  - Fixed issue with two queries being sent when refreshing the page when search string was entered (Browse page)
  - Fixed issue with filtering / unfiltering subthemes that resulted in 404 error (Browse page)
- Performance
  - Improved performance of searching for and retrieving datasets (Browse page)
  - Cubes, themes and organizations queries aren't fired anymore when previewing a dataset
  - Improved the performance of data download
  - (min|max)Inclusive values stored in `sh:or` are now also retrieved
- Style
  - Color picker's design has been adjusted to be more user-friendly
  - Map now outlines shapes on hover, instead of changing their colors
- Maintenance
  - Added retrieval of dimension units via `qudt:hasUnit` (but kept `qudt:unit` for backward compatibility)
  - Improved GQL debug panel (added resolver variables and rectangles to visually indicate resolving times)

# [3.23.0] - 2023-10-17

- Features
  - Added a new group of charts – Combo charts – that includes multi-measure line, dual-axis line and column-line charts
  - Added a way to edit and remove charts for logged in users
  - Improved user profile page
- Fixes
  - Big datasets should now be possible to download (disabled API route size limit)
  - It's now again possible to enable interactive segment filters

# [3.22.9] - 2023-10-06

- Fixes
  - Cascading filters are not stuck anymore in the loading mode in some cases
- Maintenance
  - GQL debug panel now includes queries fired through SPARQLClientStream (e.g. hierarchies) and CONSTRUCT queries
  - Configurator and interactive filters debug panel is now displayed if `flag__debug` is set to true
- Docs
  - Added chart preview via API section to the documentation

# [3.22.8] - 2023-09-29

- Fixes
  - Cube checker now correctly checks if dimensions are present
  - It's now possible to change the chart type for copied, non-hierarchical charts without having to open an options panel first
  - Interactive filters are now aligned correctly (y axis)
- Performance
  - Dataset preview should now load quicker as we no longer fetch dimension values along with it

# [3.22.6] - 2023-09-19

- Features
  - Animated charts now show latest data as default
- Fixes
  - Table docs now work correctly again
  - Cascading mode now works correctly for hierarchical dimensions used as interactive filters
  - Changing the locale when previewing a larger cube no longer triggers multiple locale switches

# [3.22.5] - 2023-09-12

- Fixes
  - It's now again possible to map all colors for hierarchical dimensions used as segmentation
- Misc
  - Improved `langString` error message

# [3.22.4] - 2023-09-06

- Docs
  - Update legal framework

# [3.22.3] - 2023-09-05

- Fixes
  - Animation field not updating
  - Infinite loading of homepage chart

# [3.22.2] - 2023-09-05

- Fixes
  - Fixed sorting of dates in XLSX download

# [3.22.1] - 2023-09-05

- Fixes
  - Revert removal of `--openssl-legacy-provider``

# [3.22.0] - 2023-09-05

- Features
  - Interactive filters now work in cascading mode
  - Date picker is now usable with interactive temporal dimension filters
  - Downloaded data is now sorted automatically, according to dimension types
  - XLSX data download now correctly formats values (e.g. numbers are numbers and not strings)
  - Disabled stacking of non-ratio measures (area and column charts)
- UI
  - Error message is now displayed if there are no geometries available for both area and symbol layers (depending on whether one or the other is used)
  - Introduced a warning message when choosing an Animation while a Temporal dimension is mapped to other field
  - Slightly reduced distances between color legend items in interactive mode
- Fixes
  - Map chart is now again correctly initialized when hierarchy is there
  - Redirect to versioned cubes now works correctly when using legacy, `/browse/dataset/<iri>` mode
  - Undefined dates in Temporal dimensions do not break the application anymore
  - Jenks color legend now correctly calculates thresholds
  - Numerical color legends now dynamically adjust heights to prevent cutting longer tick labels

# [3.21.1] - 2023-08-22

- Features
  - Introduced preferred chart type order, which makes the table chart the least preferred option
- UI
  - Switched to pixel-perfect text width calculation - axes should now align correctly, without unnecessary padding that was the result of incorrect estimations
  - Added `text-wrap: balance` to homepage title, to better wrap the text (only supported by Chrome as of now)
- Fixes
  - Changing a language in published mode now correctly updates options in hierarchical select element (Interactive Filters)
- Performance
  - Vastly improved the performance of fetching geographical shapes when fetching more than 100 at once
- Maintenance
  - Correctly aligned Sentry environments with deployment environments, which will result in better performance monitoring (`vercel`, `test`, `int`, `prod`)

# [3.21.0] - 2023-08-15

- Features
  - It's now possible to animate the Map Chart 🎬 🗺️
  - It's now possible to normalize the data in Stacked Column Chart and Stacked Area Chart either in a static mode, or as an interactive filter 📊
  - Normalized stacked charts, as well as Pie chart, now display both percentages and absolute values in the tooltip
  - Added support for a new dimension type - TemporalOrdinalDimension. This dimension can be used in all the places where you can use regular ordinal dimensions as well as to animate the chart
  - Scatterplot and Pie now animate updates
  - Axes now animate updates
  - Tooltips for area, column and line charts now behave in more responsive way
  - Time filter now shows explicit `from` and `to` fields to filter by (and the brush snaps to values actually existing in the data)
  - Time filter now uses date picker for months and years 🗓️
  - Changed the aspect ratios of Pie and Scatterplot charts in the Editor mode, so they fit on a screen without the need to scroll
  - Interactive time range filter is now configurable via Horizontal Axis field
  - Animation field has been moved to its own category (Animations)
  - Animations can now be run in dynamic-scales mode
  - Overall UI has been slightly adjusted to better match the design. It's now possible to collapse sections inside the field editor panel
  - Call to action to fix broken area charts (missing data imputation) is now more visible
- Fixes
  - Server-side filtering of large dimensions (more than 100 filter values) now works for versioned dimensions
  - Scales now adapt to color legend filter when using time slider
  - Columns now properly animate out, instead of disappearing
  - Empty color legend is no longer shown
  - Scatterplot X axis now correctly aligns its title in Safari
  - Interactive time range filter now respects the filter range set in the X field
  - Optional filter label is now correctly shown
  - It's now again possible to choose whether or not to show standard error whiskers
  - Standard errors are now displayed in grouped bar charts' tooltips
  - "Back to main" label is now always visible when opening the left, edit panel
  - The count of filters displayed when the filter section is collapsed now displays correct value
  - Tooltips with multiple values now have formatting that is consistent with single-value tooltips
- Tests
  - Unit tests that import `rdf-js` library now run without errors
- Refactors:
  - Consolidated chart state computation logic, which should make the charts less error-prone

# [3.20.3] - 2023-07-04

- Fixes
  - Dimension values are now correctly sorted is dimension is numerical dimension
  - Stacked bar chart now doesn't render gaps in case of a missing value
  - Imputation options for area charts are now available when all segments are defined, but there are undefined values in Y dimension
- Tests
  - Introduced load tests using k6

# [3.20.2] - 2023-06-20

- Performance
  - The debug data is now only sent along with the payload when the debug mode is enabled
  - ContentMDXProvider is now only imported within the pages that actually need it instead of being included in the root of the app

# [3.20.1] - 2023-06-19

- Fixes
  - Color legend for hierarchical dimensions now shows only values that actually appear in the chart

# [3.20.0] - 2023-06-15

- Fixes
  - Sorting now works correctly for horizontal axis in column charts
  - Interactive data filters are not carried over to a new chart type when they are used as chart field
  - Interactive time range filter now works correctly in line charts
  - Interactive time range filter is now again correctly migrated to a new chart type

# [3.19.20] - 2023-06-08

- Fixes
  - Sorting now works correctly for temporal dimensions

# [3.19.19] - 2023-06-06

- Fixes
  - Bars with negative values are now correctly attached to 0 again.
  - Sorting now works correctly in line chart color legend and tables.
  - Color legend is again properly interactive.

## [3.19.18] - 2023-05-16

- Fixes
  - Columns now animate correctly when window is resized
- Misc
  - Hidden Animation field behind feature flag

## [3.19.17] - 2023-05-16

- Features
  - Added Animation field for Column, Pie and Scatter charts 🎬
  - Added animations to columns in Column chart (position, size, color)
- Fixes
  - Copying the map visualization is some rare scenarios
- Performance
  - We only fetch necessary dimensions now in published mode, which should result in faster loading times
  - The sorting of dimensions on the server-side has been removed, which should improve observations loading time
- Misc
  - Updated Spinner text (which appears when data takes a long time to load)

## [3.19.16] - 2023-05-12

- Features
  - Updated the design of minimal embed mode
- Fixes
  - Temporal dimensions usage with X axes (Column chart)

## 3.19

A particular focus was given on data fetching performance. Interactions
with visualize.admin.ch are now noticeable faster.

### Performance

- Improved performance of cube data fetching

  - Added LRU cache to min max queries
  - Added query cache to bulk queries
  - Ordered filter so that non-discriminant filter are last

- Fixed search performance through removal of combinatorial explosion due
  to language values

- Improved GraphQL query devtool
  - Display number of SPARQL queries in query list
  - Sorted queries by duration

### Features

- Embed options (ability to either embed minimal or standard chart).
  Publish actions have moved to the top of the published chart for
  better visibility.

## [3.17.0] - 2022-12-06

- Metadata is now shown in a dedicated panel that can be reached both from editor & published mode
- It's now possible to use abbreviations in color segmentations and X fields for dimension values with schema:alternateName properties

## [3.15.0] - 2022-11-29

- Add search to filters with hierarchy
- Move interactive filters in place
- Diminish banner height in search
- Increase depth limit of hierarchies to 6

## [3.13.0] - 2022-11-22

- Enhancements:
  - Cube Checker:
    - Introduced a Temporal dimensions scaleType & timeFormat checks
  - Data download:
    - Order of columns in downloaded files now matches the order visible in the dataset preview (based on shacl:order)
- Bug fixes:
  - Correctly retrieve min & max values for Temporal dimensions when scaleType is not equal to Interval

## [3.12.0] - 2022-11-15

- Editor:
  - Introduced a loading state when switching dimension iris and a dataset is using a hierarchy
  - Added a "default" color palette which becomes available to be selected in a ColorPalette element when custom schema:color properties are defined for dimension values in the Cube Creator
- Charts:
  - (table): Fixed available column styles based on dimension types (so it's not possible anymore to select "bar" cell type for nominal measures)
  - Run SPARQL button now points to a corrent data environment
  - Numbers pertaining to a dimension with a decimal datatype will be formatted
    with scientific notation
- Dataset Preview:
  - Added a "Run SPARQL query" button
- UI:
  - Introduced new UI for search & dataset preview pages
  - Updated filters editing by introducing the tree view for hierarchical dimensions
  - Introduced a structure to hierarchical dimensions in select elements in published charts

## [3.11.0] - 2022-10-26

- Charts:
  - Enable sorting of geo dimensions
  - Maintain segment sorting type correctly when switching from / to Pie chart
  - Fix sorting by measure when undefined values are present in the data
  - Enable CSS Color Module Level 3 color specifications in the color picker (instead of just HEX)
  - New "Automatic" sorting option using "identifier" or "position" or "label"
  - Sorting is enabled for line charts (sorts legend items and tooltip values)
- Map:
  - Area & symbol layers now use the same approach as for segment field (optional select element), to be more consistent across the app
  - It's now possible to use discrete color mapping in both layers
- Error messages:
  - Make missing timeFormat error message more explicit
- Tests:
  - It's now easier and speedier to write E2E tests

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
