# Visualization Tool

<!-- vscode-markdown-toc -->
* 1. [Documentation](#Documentation)
* 2. [Development Environment](#DevelopmentEnvironment)
	* 2.1. [Setting up the dev environment](#Settingupthedevenvironment)
	* 2.2. [Dev server](#Devserver)
	* 2.3. [Building the Embed script `/dist/embed.js`](#BuildingtheEmbedscriptdistembed.js)
	* 2.4. [Database migrations](#Databasemigrations)
* 3. [Versioning](#Versioning)
* 4. [Developing GitHub Actions](#DevelopingGitHubActions)
* 5. [E2E tests](#E2Etests)
* 6. [Visual regression tests](#Visualregressiontests)
* 7. [GraphQL performance tests](#GraphQLperformancetests)
	* 7.1. [Automation](#Automation)
	* 7.2. [How to add or modify the tests](#Howtoaddormodifythetests)
* 8. [Load tests](#Loadtests)
	* 8.1. [Automation](#Automation-1)
	* 8.2. [Local setup](#Localsetup)
	* 8.3. [Running the tests locally](#Runningthetestslocally)
	* 8.4. [Recording the tests using Playwright](#RecordingthetestsusingPlaywright)
* 9. [Authentication](#Authentication)
	* 9.1. [Locally](#Locally)
* 10. [Translations](#Translations)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

##  1. <a name='Documentation'></a>Documentation

Public documentation is available at https://visualize.admin.ch/docs/.

##  2. <a name='DevelopmentEnvironment'></a>Development Environment

To start the development environment locally, you need a Postgres database. There's a
[docker-compose.yml](./docker-compose.yml) for this if you have e.g.
[Docker Desktop](https://www.docker.com/products/docker-desktop) installed.

In addition, you need to run a [Node.js](https://nodejs.org/) server on your machine
or use [Nix](https://nixos.org) with the [shell.nix](./shell.nix) in this directory.

###  2.1. <a name='Settingupthedevenvironment'></a>Setting up the dev environment

1. Make sure Docker is running
2. Start the Postgres database with `docker-compose up`
3. Run the setup script:

```sh
yarn setup:dev
```

###  2.2. <a name='Devserver'></a>Dev server

Once the application's set up, you can start the development server with

```sh
yarn dev
yarn dev:ssl # If you are working with the login process
```

> ℹ️ When using the authentication, you need to use https otherwise you'll
> experience an SSL error when the authentication provider redirects you back to
> the app after login. You can either remove the trailing 's' in the URL after the
> redirection, or use the `yarn dev:ssl` command to use HTTPS for the
> development server. Also, make sure to set the `NEXTAUTH_URL` environment
> variable to `https://localhost:3000` in your `.env.local` file. If you'd like
> to use `yarn e2e:ui:ssl` or `yarn e2e:dev:ssl` in order to run tests locally
> on pages that are protected by authentication please add `E2E_ENV=true` to
> your environment.

> 👉 In [Visual Studio Code](https://code.visualstudio.com/), you can also run
> the **default build task** (CMD-SHIFT-B) to start the dev server, database
> server, and TypeScript checker (you'll need [Nix](https://nixos.org) for that
> to work).

To run the application with debugging enabled through VSCode, make sure the dev
server is running and then click the "Run and Debug" button in the sidebar
(CMD-SHIFT-D). Then select the "Launch Chrome" configuration. This will open a
new Chrome window with the dev tools open. You can now set breakpoints in the
code and they will be hit.


###  2.3. <a name='BuildingtheEmbedscriptdistembed.js'></a>Building the Embed script `/dist/embed.js`

Currently, the embed script is not automatically built when the dev server
starts.

Run the following command when you're changing the source file in
`embed/index.ts`.

```sh
yarn dev:rollup
```

> Currently, this only bundles and initializes
> [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) but could
> be used to render charts without iframes (using
> [custom elements](https://developers.google.com/web/fundamentals/web-components/customelements)
> or render to a generic DOM element) in the future.

###  2.4. <a name='Databasemigrations'></a>Database migrations

Database migrations are run automatically when a production build of the app
starts. In _development_, you'll have to run them manually:

```sh
yarn db:migrate:dev
```

> [!WARNING]
>
> On Vercel environments like "preview" and "production", database
> migrations are executed. Since all environments are sharing the same database,
> it means that a database migration executing on 1 database could be disruptive
> to other preview deployments. For example adding a column to the schema would
> be disruptive, since other preview deployments would try to remove it (since
> the column is not yet in the schema).
>
> To prevent any problems on preview deployments, we suggest setting up a second,
> dedicated database for development if you are working on a
> branch that brings in database changes.
> If you are using a service like Vercel, you can configure this in the
> corresponding environment variables. Take care of scoping the new environment
> variables to the preview branch you are working on. After merging the branch,
> you can delete the environment variables scoped to the branch.

##  3. <a name='Versioning'></a>Versioning

New versions of `package.json` are built on GitLab CI into a separate image that
will be deployed to the integration env.

```sh
yarn version
```

This will prompt for a new version. The `postversion` script will automatically
try to push the created version tag to the origin repository.


##  4. <a name='DevelopingGitHubActions'></a>Developing GitHub Actions

Several checks are run on different types of events that happen within the
repository, including E2E or GraphQL performance tests. In order to be able to
build and test the actions locally, we use [act](https://github.com/nektos/act),
with example mocked event payloads defined in
[this folder](https://github.com/visualize-admin/visualization-tool/tree/main/act).

After [installing](https://nektosact.com/installation/index.html) the library,
you can run a given action like e.g.
`act deployment_status -W ".github/workflows/performance-tests-pr.yml" -e act/deployment_status.json`,
modifying the event payload or adding a new one as needed.

##  5. <a name='E2Etests'></a>E2E tests

Playwright is run on every successful deployment of a branch. Screenshots are
made with Percy and sent directly to their cloud service for diffing.

A special [test page](http://localhost:3000/en/__test) shows all the charts that
are screenshotted. Those charts configurations are kept in the repository.

##  6. <a name='Visualregressiontests'></a>Visual regression tests

It's sometimes useful to run visual regression tests, especially when modifying
chart configurator or chart config schemas. To make sure that the changes don't
break the existing charts, we implemented a way to do a baseline vs. comparison
tests.

To run the tests, you should check out the instruction in
[e2e/all-charts.spec.ts](https://github.com/visualize-admin/visualization-tool/blob/main/e2e/all-charts.spec.ts)
file.

##  7. <a name='GraphQLperformancetests'></a>GraphQL performance tests

The project uses a combination of [k6](https://k6.io) and
[Grafana](https://grafana.com) with
[Prometheus](https://k6.io/docs/results-output/real-time/prometheus-remote-write/)
for GraphQL performance testing.

###  7.1. <a name='Automation'></a>Automation

To ensure constant monitoring of the performance of selected GraphQL queries,
the performance tests are run
[once an hour](https://github.com/visualize-admin/visualization-tool/blob/main/.github/workflows/performance-tests.yml)
against each environment of the application. The results are then sent to the
governmental Grafana dashboards.

###  7.2. <a name='Howtoaddormodifythetests'></a>How to add or modify the tests

To add or modify the performance tests, go to the
[k6/performance-tests](https://github.com/visualize-admin/visualization-tool/tree/main/k6/performance-tests)
folder. The GitHub Action is generated by running the `yarn run github:codegen`
command; be sure to run it after modifying the
[generate-github-actions.mjs](https://github.com/visualize-admin/visualization-tool/blob/main/k6/performance-tests/generate-github-actions.mjs)
file.

##  8. <a name='Loadtests'></a>Load tests

The project uses [k6](https://k6.io) for load testing.

###  8.1. <a name='Automation-1'></a>Automation

There is a
[dedicated GitHub Action](https://github.com/visualize-admin/visualization-tool/actions/workflows/manual-load-test.yml)
that runs the API load tests against selected environment. You can investigate
the results by going to Actions section in GitHub and checking the summary
results. They are also visible in the cloud (k6.io), if you enable the cloud
option.

###  8.2. <a name='Localsetup'></a>Local setup

In order to run the tests locally, follow the
[documentation](https://k6.io/docs/get-started/installation/) to install `k6` on
your machine.

###  8.3. <a name='Runningthetestslocally'></a>Running the tests locally

You might want to run the script locally, for example to be able to bypass the
cloud limitations of k6 (e.g. max number of VUs bigger than 50). To run a given
load test, simply run

```sh
k6 run k6/script-name.js
```

replacing the `script-name` with an actual name of the test you want to run.
Optionally, you can tweak the configuration of each test by directly modifying
the `options` object inside a given script and running `yarn k6:codegen` to make
the JavaScript files up-to-date.

For the GraphQL tests, you'll also need to pass `--env ENV=(test|int|prod)` flag
to point to the proper environment and
`--env ENABLE_GQL_SERVER_SIDE_CACHE=(true | false)` to control whether to use
GQL server-side caching.

###  8.4. <a name='RecordingthetestsusingPlaywright'></a>Recording the tests using Playwright

While some tests are written manually, other tests come from HAR recordings that
span a broad set of actions. In order to record a HAR file and convert it into
k6 script, use the `testAndSaveHar` inside `e2e/har-utils.ts` file.

Simply import that function inside a given e2e test and replace the regular
`test` call with `testAndSaveHar`. Note that you need to specify environment
against which to run the test, filename and path to save the file.

> ⚠️ The `testAndSaveHar` function exposes a `baseUrl` property, which needs to
> be injected into the `page.goto` calls.

After the HAR file has been recorded, use
[har-to-k6](https://k6.io/docs/test-authoring/create-tests-from-recordings/using-the-har-converter/#:~:text=The%20har%2Dto%2Dk6%20converter,to%20export%20recorded%20HTTP%20requests.)
library to convert the file into k6 script (and put it into the `k6/har`
folder). Remember to add `--add-sleep` flag to include pauses between requests.
Afterwards, edit the `options` variable at the top of the file to set the
parameters for the test.

> ⚠️ You might want to remove requests to Google afterwards manually, to remove
> false-positives of blocked requests.

##  9. <a name='Authentication'></a>Authentication

By default, authentication is provided by the Swiss federal government's eIAM through ADFS.
We use Next-auth to integrate our application with it through a
[custom Provider](app/auth-providers/adfs.ts). For testing locally and on
Vercel previews we use a custom test user account using nextauth credentials provider.

###  9.1. <a name='Locally'></a>Locally

You can use the ref eIAM. ADFS environment variables should be configured in
your `.env.local` file.

Make sure to set the `NEXTAUTH_URL` environment variable to
`https://localhost:3000` and run the dev server with `yarn dev:ssl`.

##  10. <a name='Translations'></a>Translations

Translations are managed via [Accent](https://accent.interactivethings.io).
Right now, you need to manually pull and push the translations. The process
goes:

1. Edit components, add `<Trans />` and `t()`
2. Run `yarn locales:extract` to write the `en/messages.po`
3. Run `yarn locales:push --dry-run` to review what will be pushed to Accent
4. Run `yarn locales:push` to push the new translations to Accent
5. Edit the new messages in Accent web UI `yarn locales:browse`
6. Run `yarn locales:pull` to get the messages.po for all translated languages

In the future, we might want to integrate further Accent so that it opens pull
requests.

> ℹ️ To automatically authenticate with Accent, you can set the `ACCENT_API_KEY`
> environment variable in your `.env` file in the root of the project. You can
> find the API key in the Accent web UI. Otherwise, you can add the key inline
> when running the command, e.g. `ACCENT_API_KEY=your_key yarn locales:push`.
