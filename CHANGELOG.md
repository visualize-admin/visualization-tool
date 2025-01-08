# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

You can also check the
[release page](https://github.com/visualize-admin/visualization-tool/releases)

# Unreleased

- Features
  - It's now possible to export charts as images
- Fixes
  - Color mapping is now correctly kept up to date in case of editing an old
    chart and the cube has been updated in the meantime and contains new values
    in the color dimension
  - Fixed preview via API (iframe)
  - Fixed cut table scroll-bars and unnecessary scroll of bar charts when
    switching between chart types
  - Sorting dataset results by score option is now correctly available to select
- Maintenance
  - Re-enabled screenshot tests using Argos CI
  - Fixed E2E HAR-based tests
  - Fixed map dimension symbols to increase the elements size for small values,
    whilst preventing any 0 and undefined values from displaying
  - Added Footer to the Profile Page
- Docs
  - Added auto-generated JSON Schema files for configurator state and chart
    config and improved preview charts via API documentation

# [5.0.2] - 2024-11-28

- Features
  - Made it possible to sort the cube search results and filter by draft
    datasets when looking for a cube to merge
- Fixes
  - Changed component id separator text to be more unique, as it was causing
    issues with some cubes that had iris ending with "-"
  - Datasets section in the sidebar is now correctly shown at all times
  - Improved prevention of overlapping axis titles for combo charts

# [5.0.1] - 2024-11-26

- Features
  - Improved formatting of confidence intervals in tooltips
    (`, [-lower bound], [+upper bound]`)
- Fixes
  - Ensured undefined / unavailable data is represented as "-" for downloaded
    data files

# [5.0.0] - 2024-11-25

Bumped to a new major version to celebrate all the improvements and new features
introduced since v4.0.0 🎉

- Features
  - Allowed previewing of charts in states different than CONFIGURING_CHART
    (iframe `/preview` page)
  - Improved some wording and added an explanation to the `Concepts` navigation
    menu
  - Filters and components are now grouped in the left panel and dropdowns in
    case of working with merged cubes
  - Improved default chart selection when adding a new cube (by default the
    application will try to use dual-line chart with measures from different
    cubes)
  - Added tooltip that explains why a given chart type can't be selected
  - Added support for confidence intervals
- Fixes
  - Introduced a `componentId` concept which makes the dimensions and measures
    unique by adding an unversioned cube iri to the unversioned component iri on
    the server-side. With this we correctly handle multiple dimensions with the
    same iri that come from different cubes (when merging cubes)
  - Map legend is now correctly updated (in some cases it was rendered
    incorrectly on the initial render)
  - Vertical Axis measure names are now correctly displayed in the left panel
  - Uncertainties are now correctly displayed in map symbol layer tooltip
- Performance
  - We no longer load non-key dimensions when initializing a chart
- Maintenance
  - Added a way to do local visual regression testing of charts between
    different branches

# [4.9.5] - 2024-11-22

- Features
  - Added Newsletter, Bug Report and Feature Request sections to the home page
  - Moved the datasets section to the top of the sidebar
  - It's now possible to embed charts and get share links directly from the user
    profile
  - It's now possible to enable or disable single chart embed border using UI
- Fixes
  - visualize.admin.ch links are now again visible in chart footnotes
  - Improved chart tooltips on small screens
  - % mode toggle no longer overlaps with the Y axis title
  - Merging of cubes beta tag has been removed
  - Dual line Chart Tooltip indicators are now fixed for smaller screens
  - Fixed tooltip position for pie charts for smaller screens

# [4.9.4] - 2024-11-06

- Features
  - Removed a flag for shared dashboard filters

# [4.9.3] - 2024-10-29

- Fixes
  - Last table row is no longer cut

# [4.9.2] - 2024-10-04

- Features
  - Added most recent charts (all time and last 30 days) to the the Statistics
    page
  - Made the Delete chart menu action always the last one across all Menu items
- Fixes
  - Fixed inconsistent text style behavior in title and description fields
  - Fixed positioning of Menu Popover in the login profile row actions on small
    screens

# [4.9.1] - 2024-10-03

- Performance
  - Added pragmas to the SPARQL query button

# [4.9.0] - 2024-10-01

- Features
  - Added a new preview option (xl) in the layouting step
  - Changes made in the preview mode are now persisted in the free canvas
    layout, so that the user can tailor the dashboard's layout in every
    breakpoint size
  - Preview mode now takes the real size of the breakpoint, making the area
    horizontally scrollable in case the screen size is smaller than the
    breakpoint
  - Responsive embed mode has been introduced, which allows the user to embed
    the chart that will adapt its height to the content
  - It's now possible to simultaneously select browse filters from every panel
    (themes, organizations, concepts)
- Fixes
  - Interactive filters in the published mode and now only showing combinations
    of filters that are actually present in the data, taking configurator
    filters into account
  - Compact table view now works again with heatmap cells
  - Compact table view margins were improved so rows do not overlap
  - Chart title and dataset tooltips in the user profile now only shows when the
    title is truncated
  - Concepts navigation on the browse page now shows the correct number of
    results
  - Shared time slider now works correctly in cases of applied to charts from
    different cubes, where one cube has a temporal dimension and the other does
    not
  - Adding a new chart when the free canvas layout has already been initialized
    is not breaking the application anymore
  - Axis titles now wrap
  - Metadata panel is not longer shared between separate charts in a dashboard
  - Segmented line charts' whiskers have now the same color as the line

# [4.8.0] - 2024-09-11

- Features
  - It's now possible to label individual chart tabs
  - Time is now displayed in addition to date in `Last edit` column in user
    profile
  - Free canvas layout option now includes a 3-column layout, depending on the
    screen width
  - Added a new popover login menu
  - The page is now scrolled to the top when toggling shared filters in the
    layouting step
  - Past layouts are now preserved when switching between layouts in the
    layouting step
  - It's now possible to preview a chart in different sizes before publishing
    (in the layout step)
  - Clicking on a chart title in the user profile now opens the chart
- Fixes
  - Map is now correctly centered after copying a chart or switching to layout
    mode
  - Table single filters now correctly display selected state
  - Drag handles are now centered in table configurator
  - Single chart titles are now correctly displayed in user profile
  - Renaming of charts through user profile now works correctly
  - Manually entering dates in date pickers works correctly again
  - Improved scrolling behavior in the chart tabs
  - Shared time range filter now correctly positions the marks in the time
    slider
  - Single interactive filters are now constrained by config filters
- Style
  - Aligned editor and layouting page layouts
  - Removed dimension selection from modal when merging cubes
  - Updated styles of confirmation dialog
  - Various small style improvements
- Maintenance
  - Updated cube-hierarchy-query library to 3.0.0

# [4.7.4] - 2024-07-23

- Features
  - Measure's unit is now displayed in map legend
- Fixes
  - Charts now correctly maintains aspect ratio, preventing them from being
    squished
  - OpenData.swiss links are now constructed correctly in cases where
    organization is a part of identifier
  - Toast notifications are not overlapped by other content anymore
  - Chart selection tabs popover's arrow is now correctly centered

# [4.7.3] - 2024-07-18

- Fixes
  - Cube preview speed should be fine again with new Stardog version

# [4.7.2] - 2024-07-08

- Fixes
  - Going back to edit mode from free canvas layout no longer hides the chart

# [4.7.1] - 2024-07-08

- Fixes
  - Caching per cube iri is now correctly done for geo queries

# [4.7.0] - 2024-07-03

- Features
  - Added `TemporalEntityDimension` support for global dashboard filters
  - Added support for setting chart language when using preview via API mode
  - Y scale will now start at 0 for interval scale measures in appropriate chart
    types
  - Added chart tab labels
  - Shared dashboard filters now work in the Tab layout
  - Free canvas layout is now initialized with up to 4 charts per row, up from 2
  - Saved dashboards now use dashboard title, instead of concatenating chart
    titles
  - Added a new Statistics page that shows the numbers and trends related to
    created charts. You can access it via `/statistics` route
  - Standard error whiskers are now supported in line charts
  - Optimized the user profile page and preview of a draft chart
  - :flag: :new: Added an `easter-eggs` flag that allows you to enable easter
    eggs in the application
  - Published charts now have a "more options" button with two actions - "Share"
    and "Table view"
  - Shared dashboard time range filters are now rendered as one `Date` filter
    that can be used to filter all charts in the dashboard. Date range is
    combined from all charts in the dashboard and the "lowest" time unit is used
    in the time slider (e.g. if one chart has a year resolution and another has
    a month resolution, the time slider will show months)
  - Switched from in-house Cube Checker to Zazuko's Cube Validator
  - Switched INT and TEST data sources to use cached LINDAS endpoints, and added
    three uncached endpoints for testing purposes (Prod-uncached, Int-uncached,
    Test-uncached)
- Fixes
  - Fixed using a time range brush in column charts when X dimension is a
    `TemporalEntityDimension`
  - Error whiskers now display correctly at the initial render and when resizing
    the charts vertically in free canvas layout
  - Charts won't animate anymore on initial render to prevent not-so-great
    animations in some cases (e.g. bars flying in from the top)
  - When resizing a chart vertically in free canvas layout, the animation is not
    laggy anymore
  - It's possible to download full dataset again for charts based on merged
    cubes
  - Editing of a saved dashboard will now initialize in layouting step
  - It's now possible to close the dataset selection modal when creating a new
    chart in smaller browser windows
  - Saving a new dashboard when in layouting step as a logged-in user will not
    redirect to the editing step anymore
  - Metadata panel is now behaving correctly in the editing mode when editing
    several charts e.g. in a dashboard
  - Sub-theme filters now work correctly both in the search page and in the
    dataset selection modal when adding a new chart based on another cube
  - Changing dashboard time range filter presets now correctly updates the
    charts
  - Merged cubes are now merged on a chart basis and are not shared between
    charts
  - Free canvas cards are now constrained in a way that their height can't be
    too small so that content overflows or chart is not visible
  - Chart title and description is now persisted when switching between chart
    types
- Performance
  - Introduced querying per cube iri for supported endpoint (PROD LINDAS
    cached), so that we hit Varnish cache per cube
- Style
  - Cleaned up the chart footnotes and moved most of them to the metadata panel
    – it means that the footnotes don't look broken anymore for charts based on
    merged cubes. This was followed by a removal of embed options, as now every
    chart has much more minimalistic appearance
  - Global dashboard time slider won't show marks if there's more than 50 of
    them
  - Updated style of the buttons that open metadata panel
  - Data download menu now opens on click, not hover
  - Removed unnecessary row gaps in the dashboard layout when e.g. title or
    description is missing

# [4.6.1] - 2024-06-05

- Fix
  - Use bounded cache for Apollo Server, removing vulnerability from DDOS
    attacks

# [4.6.0] - 2024-06-05

- Features
  - :flag: :new: Add the "Free canvas" layout, allowing users to freely resize
    and move charts for dashboards
  - :flag: :new: Ability to start a chart from another dataset than the current
    one
  - :flag: Search via concepts is behind a flag
  - :flag: Merging of cubes is behind a flag
- Style
  - Improved the styles of metadata panel and interactive filters toggle buttons

# [4.5.1] - 2024-05-21

- Fixes
  - If there is an error on a chart contained in a dashboard, the layout is not
    be broken

# [4.5.0] - 2024-05-21

- Features
  - Improvements to add dataset workflow (columns, text, toasts when adding a
    dataset)
- Development
  - Preparation for dashboards

# [4.4.0] - 2024-05-08

- Features
  - Ability to merge two cubes on multiple columns (for example on year and
    canton)
  - Ability to search via "concepts"
  - Color legend in maps now only displays values that are actually present in
    the data (except for ordinal components)
- Fixes
  - Data source if now added for legacy charts (defaults to PROD)
  - Charts created with non-cached data source are now correctly migrated to
    cached one
- Performance
  - Cube upgrade is done only once at client side, instead of being re-fetched
    in every server-side query

# [4.3.0] - 2024-04-25

- Features
  - Added preview when joining two cubes
  - Removed flag for add-dataset, in favor of beta label

# [4.2.0] - 2024-04-23

- Features
  - Added support for using dynamic most recent date in temporal X axis
  - Introduced merging of cubes by non-temporal dimensions and updated modal to
    choose dataset to merge (behind a flag\_\_add-dataset=true)
- Fixes
  - Temporal dimension X axis filtering in case of being a join by dimension
  - Sidebar content no longer gets unmounted when data is being re-fetched (e.g.
    when interacting with time slider in temporal X axes)
  - Reduced content layout shift when changing chart type
  - Filters are now correctly applied when adding a new chart
  - Charts now resize immediately to remove a "laggy" feeling caused by calling
    transitions multiple times
- Style
  - Introduced smaller UI improvements in the options panel
- Performance
  - DataCubesObservations query no longer waits for DataCubesComponents query to
    finish in order to start executing

# [4.1.0] - 2024-04-10

- Features
  - Added support for monthly and yearly temporal entities (via a new
    `TemporalEntityDimension')
  - It's now possible to control the opacity of map symbols also in case of
    numerical or categorical colors
- Fixes
  - Fixed fetching of `PossibleFilters` when no component iris are passed (and
    stops execution completely if called when initializing a new chart from
    cube)
  - Fixed retrieval of shape labels if the given shape does not have a label in
    the currently selected locale
  - Map chart no longer shows empty state when symbol layer is the only enabled
    layer and is based on geometries, not coordinates
  - Fixed chart data caching so that chart state is preserved when changing some
    options (best seen in the map chart, where interacting with options doesn't
    reset zoom to default anymore)
- Performance
  - Switched to a cached LINDAS endpoint (PROD)
  - The application now fires the `PossibleFilters` query as soon as a chart is
    initialized, to always load filters that make sense without initial
    reloading
  - Refactored geographic queries to be simpler and use fewer queries to get the
    necessary information
- Style
  - Added black borders to map shapes to make overlaps more visible
  - Optimized the design of select elements and drag handles
- Maintenance
  - Removed some unused dependencies
  - Reduced bundle size by optimizing d3 imports

# [4.0.0] - 2024-03-26

Bumped to a new major version to celebrate all the improvements and new features
introduced since v3.0.0 🎉

# [3.27.3] - 2024-03-22

- Fixes
  - Full data download now correctly includes all cube dimensions again

# [3.27.2] - 2024-03-19

- Performance
  - Dimension values are now fetched in parallel in case of fetching for several
    dimensions at once
  - Refactored shapes and coordinates fetching to not rely on resolver chains

# [3.27.1] - 2024-03-15

- Performance
  - Hierarchies are now fetched in parallel with dimension values, rather than
    waiting for them to be fetched in advance
  - Vastly optimized the `PossibleFilters` query
- Maintenance
  - Increased the number of Playwright workers to 4

# [3.27.0] - 2024-03-12

- Features
  - Slightly increased initial map zoom level
  - Join a second dataset through temporal dimension (behind `flag__add-dataset`
    flag)
- Fixes
  - SingleURLs layout mode now correctly publishes charts
  - Redirecting to latest cube now works correctly for cases of trying to access
    old cube that didn't look like a versioned cube, but in fact was a versioned
    cube
  - Scatterplot is now correctly initialized with non-empty segment
  - Changes of segment dimension now correctly update chart config which
    prevents errors with copying published charts
  - Temporal segment is no longer carried over when switching from scatterplot
    to column chart if it was already used as X axis
  - Dimension data type is now parsed in case of two data types defined directly
    in dimension metadata
  - Currently selected locale is now persisted when using actions in user
    profile page (view chart, edit, open, share)
  - Initial zoom map is now correctly (and consistently) applied again
  - Optional filters can be added again

# [3.26.3] - 2024-03-05

- Fixes
  - Fixed an issue with fetching filter values that sometimes included values
    that couldn't be selected
  - Theme tags and now correctly sorted in dataset preview page
- Performance
  - Consolidated loading of dimension values and their metadata inside one
    CONSTRUCT query, which should improve performance
  - Disabled loading of dimension values where applicable
  - Adjusted several places in the application to not send filters when fetching
    dimension values but rather use `sh:in` property of given dimension
  - Changed the behavior of loading dimension values to populate filters to not
    block the whole application, but rather be scoped to this part of the
    application
  - Applied server-side caching to more queries
  - Optimized performance of getting dataset preview and cube metadata by not
    fetching whole cube shape

# [3.26.2] - 2024-02-23

- Fixes
  - The application no longer breaks in specific cases when filters were
    re-loaded
- Maintenance
  - Increased timeout duration for GQL API (Vercel deployments)

# [3.26.1] - 2024-02-22

- Fixes
  - Ability to copy/edit previous charts

# [3.26.0] - 2024-02-20

- Features
  - Layout step is now available without using a flag
  - Added Single URLs layout
  - Added drag and drop functionality to dashboard layouts
  - Improved responsiveness of charts in Tall layout
  - Added draft chart(s) functionality (for logged in users)
  - Added chart renaming from profile profile page
- Fixes
  - Interactive filters and table previews now work correctly in dashboard
    layout layouts
  - Table filters are now applied correctly again
  - Select elements for table column styles are not empty by default anymore
  - Disabled `Interactive` toggle for temporal dimensions used in column charts,
    as they don't support interactive filters
- Performance
  - Significantly improved performance of dataset previews
- Maintenance
  - Added GQL performance monitoring tests

# [3.25.0] - 2023-12-12

- Features
  - Added a layout step to the chart creation flow (tab layout, vertical or tall
    dashboard), accessible when using a `flag__layoutStep=true`
  - Localized cube landing pages are now supported (dcat:landingPage) 🌎
  - Temporal dimension filters can now be pinned to dynamically use the most
    recent value (so that published charts automatically switch to it when the
    cube is updated) 📅
  - Temporal dimensions can now be used as segmentation fields (excluding area
    and line charts)
- Fixes
  - Copying a link to a new visualization from a dataset preview now correctly
    includes a data source

# [3.24.2] - 2023-11-28

- Features
  - Implemented initial version of merging the cubes (not yet exposed through
    UI)
- Fixes
  - Conslidated behavior of setting initial filters (top-most hierarchy value)
    when filter was not present and multi-filter was removed
  - Fixed switching between segmentation dimensions in column charts
  - Added UTF-8 formatting to CSV and XLSX files (data download)

# [3.24.1] - 2023-11-13

- Features
  - Match drag and drop behavior for table chart and filter panel
- Fixes
  - Remove ErrorWhisker and Tooltip when error is null in Column charts
  - We now only fetch hierarchies defined in cube's shape
  - Hierarchy names are now correctly retrieved
- Performance
  - We no longer fetch shape when initalizing the cube, as we might need to
    re-fetch it again if a newer cube is required
  - Vastly improved performance of dataset preview by using a new version of
    `cube-view-query` library (`View.preview`)

# [3.24.0] - 2023-11-08

- Features
  - It's now possible to adjust Combo charts colors 🧑‍🎨
  - Subthemes are now displayed even when organization section is the second one
    (Browse page)
- Fixes
  - Color picker in now in sync with selected color palette
  - Dataset counts should now be correct in all cases
  - Dataset tags now wrap
  - It's now possible to de-select only one filter when both themes and
    organizations are filtered (Browse page)
  - Search string is now correctly persisted in search box when refreshing the
    page (Browse page)
  - Fixed issue with two queries being sent when refreshing the page when search
    string was entered (Browse page)
  - Fixed issue with filtering / unfiltering subthemes that resulted in 404
    error (Browse page)
  - Dates with timezones are now correctly parsed
- Performance
  - Improved performance of searching for and retrieving datasets (Browse page)
  - Cubes, themes and organizations queries aren't fired anymore when previewing
    a dataset
  - Improved the performance of data download
  - (min|max)Inclusive values stored in `sh:or` are now also retrieved
- Style
  - Color picker's design has been adjusted to be more user-friendly
  - Map now outlines shapes on hover, instead of changing their colors
- Maintenance
  - Added retrieval of dimension units via `qudt:hasUnit` (but kept `qudt:unit`
    for backward compatibility)
  - Improved GQL debug panel (added resolver variables and rectangles to
    visually indicate resolving times)
  - Removed deprecated `validThrough` cube filters

# [3.23.0] - 2023-10-17

- Features
  - Added a new group of charts – Combo charts – that includes multi-measure
    line, dual-axis line and column-line charts
  - Added a way to edit and remove charts for logged in users
  - Improved user profile page
- Fixes
  - Big datasets should now be possible to download (disabled API route size
    limit)
  - It's now again possible to enable interactive segment filters

# [3.22.9] - 2023-10-06

- Fixes
  - Cascading filters are not stuck anymore in the loading mode in some cases
- Maintenance
  - GQL debug panel now includes queries fired through SPARQLClientStream (e.g.
    hierarchies) and CONSTRUCT queries
  - Configurator and interactive filters debug panel is now displayed if
    `flag__debug` is set to true
- Docs
  - Added chart preview via API section to the documentation

# [3.22.8] - 2023-09-29

- Fixes
  - Cube checker now correctly checks if dimensions are present
  - It's now possible to change the chart type for copied, non-hierarchical
    charts without having to open an options panel first
  - Interactive filters are now aligned correctly (y axis)
- Performance
  - Dataset preview should now load quicker as we no longer fetch dimension
    values along with it

# [3.22.6] - 2023-09-19

- Features
  - Animated charts now show latest data as default
- Fixes
  - Table docs now work correctly again
  - Cascading mode now works correctly for hierarchical dimensions used as
    interactive filters
  - Changing the locale when previewing a larger cube no longer triggers
    multiple locale switches

# [3.22.5] - 2023-09-12

- Fixes
  - It's now again possible to map all colors for hierarchical dimensions used
    as segmentation
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
  - XLSX data download now correctly formats values (e.g. numbers are numbers
    and not strings)
  - Disabled stacking of non-ratio measures (area and column charts)
- UI
  - Error message is now displayed if there are no geometries available for both
    area and symbol layers (depending on whether one or the other is used)
  - Introduced a warning message when choosing an Animation while a Temporal
    dimension is mapped to other field
  - Slightly reduced distances between color legend items in interactive mode
- Fixes
  - Map chart is now again correctly initialized when hierarchy is there
  - Redirect to versioned cubes now works correctly when using legacy,
    `/browse/dataset/<iri>` mode
  - Undefined dates in Temporal dimensions do not break the application anymore
  - Jenks color legend now correctly calculates thresholds
  - Numerical color legends now dynamically adjust heights to prevent cutting
    longer tick labels

# [3.21.1] - 2023-08-22

- Features
  - Introduced preferred chart type order, which makes the table chart the least
    preferred option
- UI
  - Switched to pixel-perfect text width calculation - axes should now align
    correctly, without unnecessary padding that was the result of incorrect
    estimations
  - Added `text-wrap: balance` to homepage title, to better wrap the text (only
    supported by Chrome as of now)
- Fixes
  - Changing a language in published mode now correctly updates options in
    hierarchical select element (Interactive Filters)
- Performance
  - Vastly improved the performance of fetching geographical shapes when
    fetching more than 100 at once
- Maintenance
  - Correctly aligned Sentry environments with deployment environments, which
    will result in better performance monitoring (`vercel`, `test`, `int`,
    `prod`)

# [3.21.0] - 2023-08-15

- Features
  - It's now possible to animate the Map Chart 🎬 🗺️
  - It's now possible to normalize the data in Stacked Column Chart and Stacked
    Area Chart either in a static mode, or as an interactive filter 📊
  - Normalized stacked charts, as well as Pie chart, now display both
    percentages and absolute values in the tooltip
  - Added support for a new dimension type - TemporalOrdinalDimension. This
    dimension can be used in all the places where you can use regular ordinal
    dimensions as well as to animate the chart
  - Scatterplot and Pie now animate updates
  - Axes now animate updates
  - Tooltips for area, column and line charts now behave in more responsive way
  - Time filter now shows explicit `from` and `to` fields to filter by (and the
    brush snaps to values actually existing in the data)
  - Time filter now uses date picker for months and years 🗓️
  - Changed the aspect ratios of Pie and Scatterplot charts in the Editor mode,
    so they fit on a screen without the need to scroll
  - Interactive time range filter is now configurable via Horizontal Axis field
  - Animation field has been moved to its own category (Animations)
  - Animations can now be run in dynamic-scales mode
  - Overall UI has been slightly adjusted to better match the design. It's now
    possible to collapse sections inside the field editor panel
  - Call to action to fix broken area charts (missing data imputation) is now
    more visible
- Fixes
  - Server-side filtering of large dimensions (more than 100 filter values) now
    works for versioned dimensions
  - Scales now adapt to color legend filter when using time slider
  - Columns now properly animate out, instead of disappearing
  - Empty color legend is no longer shown
  - Scatterplot X axis now correctly aligns its title in Safari
  - Interactive time range filter now respects the filter range set in the X
    field
  - Optional filter label is now correctly shown
  - It's now again possible to choose whether or not to show standard error
    whiskers
  - Standard errors are now displayed in grouped bar charts' tooltips
  - "Back to main" label is now always visible when opening the left, edit panel
  - The count of filters displayed when the filter section is collapsed now
    displays correct value
  - Tooltips with multiple values now have formatting that is consistent with
    single-value tooltips
- Tests
  - Unit tests that import `rdf-js` library now run without errors
- Refactors:
  - Consolidated chart state computation logic, which should make the charts
    less error-prone

# [3.20.3] - 2023-07-04

- Fixes
  - Dimension values are now correctly sorted is dimension is numerical
    dimension
  - Stacked bar chart now doesn't render gaps in case of a missing value
  - Imputation options for area charts are now available when all segments are
    defined, but there are undefined values in Y dimension
- Tests
  - Introduced load tests using k6

# [3.20.2] - 2023-06-20

- Performance
  - The debug data is now only sent along with the payload when the debug mode
    is enabled
  - ContentMDXProvider is now only imported within the pages that actually need
    it instead of being included in the root of the app

# [3.20.1] - 2023-06-19

- Fixes
  - Color legend for hierarchical dimensions now shows only values that actually
    appear in the chart

# [3.20.0] - 2023-06-15

- Fixes
  - Sorting now works correctly for horizontal axis in column charts
  - Interactive data filters are not carried over to a new chart type when they
    are used as chart field
  - Interactive time range filter now works correctly in line charts
  - Interactive time range filter is now again correctly migrated to a new chart
    type

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
  - We only fetch necessary dimensions now in published mode, which should
    result in faster loading times
  - The sorting of dimensions on the server-side has been removed, which should
    improve observations loading time
- Misc
  - Updated Spinner text (which appears when data takes a long time to load)

## [3.19.16] - 2023-05-12

- Features
  - Updated the design of minimal embed mode
- Fixes
  - Temporal dimensions usage with X axes (Column chart)

## 3.19

A particular focus was given on data fetching performance. Interactions with
visualize.admin.ch are now noticeable faster.

### Performance

- Improved performance of cube data fetching

  - Added LRU cache to min max queries
  - Added query cache to bulk queries
  - Ordered filter so that non-discriminant filter are last

- Fixed search performance through removal of combinatorial explosion due to
  language values

- Improved GraphQL query devtool
  - Display number of SPARQL queries in query list
  - Sorted queries by duration

### Features

- Embed options (ability to either embed minimal or standard chart). Publish
  actions have moved to the top of the published chart for better visibility.

## [3.17.0] - 2022-12-06

- Metadata is now shown in a dedicated panel that can be reached both from
  editor & published mode
- It's now possible to use abbreviations in color segmentations and X fields for
  dimension values with schema:alternateName properties

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
    - Order of columns in downloaded files now matches the order visible in the
      dataset preview (based on shacl:order)
- Bug fixes:
  - Correctly retrieve min & max values for Temporal dimensions when scaleType
    is not equal to Interval

## [3.12.0] - 2022-11-15

- Editor:
  - Introduced a loading state when switching dimension iris and a dataset is
    using a hierarchy
  - Added a "default" color palette which becomes available to be selected in a
    ColorPalette element when custom schema:color properties are defined for
    dimension values in the Cube Creator
- Charts:
  - (table): Fixed available column styles based on dimension types (so it's not
    possible anymore to select "bar" cell type for nominal measures)
  - Run SPARQL button now points to a corrent data environment
  - Numbers pertaining to a dimension with a decimal datatype will be formatted
    with scientific notation
- Dataset Preview:
  - Added a "Run SPARQL query" button
- UI:
  - Introduced new UI for search & dataset preview pages
  - Updated filters editing by introducing the tree view for hierarchical
    dimensions
  - Introduced a structure to hierarchical dimensions in select elements in
    published charts

## [3.11.0] - 2022-10-26

- Charts:
  - Enable sorting of geo dimensions
  - Maintain segment sorting type correctly when switching from / to Pie chart
  - Fix sorting by measure when undefined values are present in the data
  - Enable CSS Color Module Level 3 color specifications in the color picker
    (instead of just HEX)
  - New "Automatic" sorting option using "identifier" or "position" or "label"
  - Sorting is enabled for line charts (sorts legend items and tooltip values)
- Map:
  - Area & symbol layers now use the same approach as for segment field
    (optional select element), to be more consistent across the app
  - It's now possible to use discrete color mapping in both layers
- Error messages:
  - Make missing timeFormat error message more explicit
- Tests:
  - It's now easier and speedier to write E2E tests

## [3.10.0] - 2022-10-19

- Improve loading performance for larger cubes

## [3.9.6] - 2022-10-12

- Fix: IRIs of NFI cubes (previously there was None-None- includes in IRI; it
  was removed recently and we now migrate old IRIs to new IRIs)

## [3.9.5] - 2022-10-04

- Charts: fix bugs that caused scatterplot and pie charts to crash in case no
  categorical dimensions were present in a dataset
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

- Dataset preview and chart edition: tooltips displaying dimension description
  are shown

### Fixes

- Search: improve response times
- Maps: Lakes are above dataviz layer

## [3.8.0] - 2022-09-15

- Search
  - Improve search time
  - Input value is kept when URL is shared
- Added migrations of chart configs (breaking changes to schema will not break
  existing charts)
- Tech
  - Diminish size of Javascript that is shipped to the client. Should improve
    page load performance
- Charts
  - Better formatting of numbers inside chart tooltips (for example for
    currencies)
- Filters
  - Initially, left filters are ordered so that dimension with hierarchy are at
    the top. Additionally, the topmost hierarchical value with a value is
    selected.
  - Color palette field has nicer UI

Note: We will try in the future to better follow semantic versioning.

## [3.7.11] - 2022-09-09

- 🚀 Maps
  - Symbols can now be colored according to a measure
  - Tilting /rotating is disabled
- 🐛 Hierarchies: Fixes, better order in the left filters when there are
  multiple roots
- 🐛 Table view: bug fix when switching from chart view on published view

## [3.7.10] - 2022-08-26

- Font adjustment in filters menu

## [3.7.9] - 2022-08-25

- Column order is based on the shacl:order defined in the data
  - For the dataset preview
  - For the table chart columns
- Default state for area chart uses the hierarchy and selects bottommost
  children
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

- Add an option to see cubes from different LINDAS environments within one
  Visualize instance
- Store data source in charts' configs
- Improvement to hierarchy handling
  - See hierarchies in left filters
  - See hierarchies in the legend
  - Selection of values as part of segmentation now supports search and has been
    redesigned for clarity
- Improvements to default selection of values for segmentation
  - Only 7 values
- Legend symbols: squares (instead of lines) are used for pie / area / columns
  bar
- Ability to lock a map to the current viewed bounding box

## [3.7.4] - 2022-05-31

- Do not show "Run SPARQL query" button if SPARL_EDITOR variable not set
- Add link top opendata.swiss when the cube is published there (chart
  footnotes + chart preview info panel)
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
- Only the top 7 nav items are shown in the search nav bar (design alignment), a
  button is there to display more
- Added the footer in the search page
- Maps chloropleth are shown under map labels. Maps symbols are shown over most
  map features. When zooming via the buttons, we now have a smooth transition
- Removed chart selection step; selection of a chart type can now be done at any
  point when creating a chart (added a new chart selection tabs UI)
- Implemented logic to keep as much chart configuration as possible when
  switching chart type

## [3.4.10] - 2022-04-11

- Search improvements (handles trailing space and casing)
- Data download improvements (new UI with an ability to select XLSX file format)
- Raw data preview from the chart level
- Fixed parsing of xsd:gYearMonth timeFormat in TemporalDimension
- Updated date formatting for the Month timeUnit to be more user-friendly
- Changed pie chart legend symbol from line to square
- Migration to MUI

## [3.4.7] - 2022-02-18

- Search has been improved
  https://github.com/visualize-admin/visualization-tool/pull/256
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

- Hide all elements related to labels, not only text by @bprusinowski in
  https://github.com/visualize-admin/visualization-tool/pull/387
- Do not set automatically empty filters by @ptbrowne in
  https://github.com/visualize-admin/visualization-tool/pull/384
- Do not show standard error in possible filters by @ptbrowne in
  https://github.com/visualize-admin/visualization-tool/pull/395
- Fix search and drafts count by @ptbrowne in
  https://github.com/visualize-admin/visualization-tool/pull/396
- Map improvements by @bprusinowski in
  https://github.com/visualize-admin/visualization-tool/pull/397

## [3.4.0] - 2022-02-18

### Features

#### Navigation

- Page have improved titles now, depending on where you are on the application.
  Helpful when you have multiple tabs with visualize.admin or when you bookmark
  things. [#331](https://github.com/visualize-admin/visualization-tool/pull/331)
- Theme and organization navigation counts take into account the search field
  now. [#329](https://github.com/visualize-admin/visualization-tool/pull/329)
- Improved chart editing navigation
  [#337](https://github.com/visualize-admin/visualization-tool/pull/337)
- Improved chart publish action buttons
  [#337](https://github.com/visualize-admin/visualization-tool/pull/337)

#### Maps

- Implemented a new base layer which makes use of vector tiles
  [#351](https://github.com/visualize-admin/visualization-tool/pull/351)

#### Filters

- Improved cascading filters selection to ensure data is shown after filter
  selection
  [#343](https://github.com/visualize-admin/visualization-tool/pull/343)
- Improved initial filter selection to ensure data is shown on the selecting
  chart type step
  [#327](https://github.com/visualize-admin/visualization-tool/pull/327)

#### Standard error

- Standard errors are displayed automatically for column chart and grouped
  column chart.
  [#352](https://github.com/visualize-admin/visualization-tool/pull/352)
  [#356](https://github.com/visualize-admin/visualization-tool/pull/356)
- Tooltip for simple column chart contain the standard error.
  [#366](https://github.com/visualize-admin/visualization-tool/pull/366)

### Bugs

- Fix selection of optional date filter
  [#332](https://github.com/visualize-admin/visualization-tool/pull/332)
- Fix discrete color scales with less than 3 observations
  [#309](https://github.com/visualize-admin/visualization-tool/pull/309)

## [3.3.0] - 2022-02-07

### Maps

It is now possible to use maps as a new visualization type. Quantities can be
encoded as a scatterplot on the map. Datasets which have GeoShapes or
GeoCoordinates dimensions can be charted on a map.

[#294](https://github.com/visualize-admin/visualization-tool/pull/294)
[#289](https://github.com/visualize-admin/visualization-tool/pull/289)
[#292](https://github.com/visualize-admin/visualization-tool/pull/292)
[#286](https://github.com/visualize-admin/visualization-tool/pull/286)
[#240](https://github.com/visualize-admin/visualization-tool/pull/240)
[#293](https://github.com/visualize-admin/visualization-tool/pull/293)
[#301](https://github.com/visualize-admin/visualization-tool/pull/301)
[#302](https://github.com/visualize-admin/visualization-tool/pull/302)

### Cascading filters

Now the left panel filters are cascading filters: values chosen for above
filters will be taken into account for below filters. Also, optional filters are
not shown at first but can be added via a menu.

[#271](https://github.com/visualize-admin/visualization-tool/pull/271)

### Misc

- Banner and icons have been removed on the homepage
  [#297](https://github.com/visualize-admin/visualization-tool/pull/297)
- Ordinal dimensions values are now sorted in various places (legend, right
  filters, tooltips)
  [#262](https://github.com/visualize-admin/visualization-tool/pull/262)
- Dataset loading errors have been improved
  [#304](https://github.com/visualize-admin/visualization-tool/pull/304)
- 🐛 By default, search results are sorted by relevance
  [#273](https://github.com/visualize-admin/visualization-tool/pull/273)
- A small description text is shown while browsing all datasets
  [#268](https://github.com/visualize-admin/visualization-tool/pull/268)
- Drag and drop is available on all the row, not only on the icon for table
  chart groups
  [#265](https://github.com/visualize-admin/visualization-tool/pull/265)
- _beta_ Hierarchical filters are available behind a flag on the "red list"
  dataset [#233](https://github.com/visualize-admin/visualization-tool/pull/233)
- 🐛 Links from openswissdata should work correctly
  [#303](https://github.com/visualize-admin/visualization-tool/pull/303)
  [#314](https://github.com/visualize-admin/visualization-tool/pull/314)

## [0.6.0] - 2020-05-25

### Added

- Option for sorting elements in charts (e.g. sorting column charts by value
  instead of alphabetically)
- Option for defining custom colors for individual values.

### Fixed

- Only allow temporal dimensions for line and area chart x-axis
- Only show scrollbars when necessary
- Show loading indicator in editor when data is reloading

## [0.5.2] – 2020-05-04

### Added

- To prevent search indexing of staging environments, the header `X-Robots-Tag`
  will be set to `noindex, nofollow` unless the env variable
  `ALLOW_SEARCH_BOTS=true` is set.

### Fixed

- Disabled compilation of dependencies in node_modules with Babel. This resolves
  some build issues.

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

- GraphQL API: Move all SPARQL/Data Cube fetching and transformation logic
  behind a GraphQL API
- "Copy Visualization" feature

### Changed

- Remove dependency on [vega](https://vega.github.io/vega/) and replace with
  custom React + D3 charts

### Removed

- Remote Data logic, SWR (both replaced by GraphQL)

## [0.3.0]

TODO
