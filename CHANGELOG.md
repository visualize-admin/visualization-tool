# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

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