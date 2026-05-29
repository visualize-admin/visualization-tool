[back](../README.md)

# Functional Testing

## Unit tests

Run all unit test in watch mode:

```sh
yarn test
```

Generate a coverage report:

```sh
yarn test:coverage
```

Run tests using the vitest ui:

```sh
yarn test:ui
```

## End-to-end tests (E2E)

Playwright is run for every push to a branch against an ephemeral instance that
is deployed to Vercel.

A special [test page](http://localhost:3000/en/__test) shows all the charts used
in the E2E suite. Those chart configurations are kept in the repository.

To run the E2E tests locally:

```sh
yarn e2e:dev
```

To launch the Playwright UI and run tests interactively:

```sh
yarn e2e:ui
```

Some e2e use har files to mock the backend. To update the har files, you can use
the following command:

```sh
yarn e2e:har-update <test-file-name>
```

Commit the updated zip file(s) to the repository.

## Visual regression tests

It's sometimes useful to run visual regression tests, especially when modifying
chart configurator or chart config schemas. To make sure that the changes don't
break the existing charts, we implemented a way to do a baseline vs. comparison
tests locally.

To run the tests, you should check out the instruction in
[e2e/all-charts.spec.ts](../e2e/all-charts.spec.ts) file.
