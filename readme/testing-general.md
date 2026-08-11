[back](../README.md)

# Testing General

## Testing Strategy

- Unit tests with Vitest and React Testing Library
- E2E tests with Playwright for critical user flows
- Visual regression tests for chart rendering
- Performance tests for GraphQL queries and data loading
- Load testing for API endpoints

## Developing GitHub Actions

Several checks are run on different types of events that happen within the
repository, including E2E or GraphQL performance tests. In order to be able to
build and test the actions locally, we use [act](https://github.com/nektos/act),
with example mocked event payloads defined in [the act/ directory](../act).

After
[installing the act library](https://nektosact.com/installation/index.html), you
can run a given action like e.g.
`act deployment_status -W ".github/workflows/performance-tests-pr.yaml" -e act/deployment_status.json`,
modifying the event payload or adding a new one as needed.
