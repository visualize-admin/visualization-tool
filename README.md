# Visualization Tool

<!-- vscode-markdown-toc -->

- 1. [Documentation](#Documentation)
- 2. [Development Environment](#DevelopmentEnvironment)
  - 2.1. [Setting up the dev environment](#Settingupthedevenvironment)
  - 2.2. [Dev server](#Devserver)
  - 2.3. [Postgres database](#Postgresdatabase)
  - 2.4. [Building the Embed script `/dist/embed.js`](#BuildingtheEmbedscriptdistembed.js)
    - 2.4.1. [Database migrations](#Databasemigrations)
- 3. [Versioning](#Versioning)
- 4. [Deployment](#Deployment)
  - 4.1. [Heroku](#Heroku)
  - 4.2. [Abraxas](#Abraxas)
  - 4.3. [Docker (anywhere)](#Dockeranywhere)
- 5. [E2E tests](#E2Etests)
- 6. [GraphQL performance tests](#GraphQLperformancetests)
  - 6.1. [Automation](#Automation)
  - 6.2. [How to add or modify the tests](#Howtoaddormodifythetests)
- 7. [Load tests](#Loadtests)
  - 7.1. [Automation](#Automation-1)
  - 7.2. [Local setup](#Localsetup)
  - 7.3. [Running the tests locally](#Runningthetestslocally)
  - 7.4. [Recording the tests using Playwright](#RecordingthetestsusingPlaywright)
- 8. [Authentication](#Authentication)
  - 8.1. [Locally](#Locally)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## Documentation

A public documentation is available at https://visualize.admin.ch/docs/.

## Development Environment

To start the development environment, you need a Docker runtime, e.g. [Docker Desktop](https://www.docker.com/products/docker-desktop) and [Nix](https://nixos.org).

### Setting up the dev environment

1. Make sure that Docker is running
2. Start the Postgres database with `docker-compose up`
3. Run the setup script:

```sh
yarn setup:dev
```

### Dev server

Once the application's set up, you can start the development server with

```sh
yarn dev
yarn dev:ssl # If you are working with the login process
```

> ℹ️ When using the authentication, you need to use https otherwise you'll experience an SSL
> error when the authentication provider redirects you back to the app after login. You
> can either remove the trailing s in the URL after the redirection, or use the `yarn dev:ssl`
> command to use HTTPs for the development server.

> 👉 In [Visual Studio Code](https://code.visualstudio.com/), you also can run the **default build task** (CMD-SHIFT-B) to start the dev server, database server, and TypeScript checker (you'll need [Nix](https://nixos.org) for that to work).

To run the application with debugging enabled through VSCode, make sure the dev server is running and the click the "Run and Debug" button in the sidebar (CMD-SHIFT-D). Then select the "Launch Chrome" configuration. This will open a new Chrome window with the dev tools open. You can now set breakpoints in the code and they will be hit.

### Postgres database

If the database server is not running, run:

```sh
docker-compose up
```

### Building the Embed script `/dist/embed.js`

Currently, the embed script is not automatically built when the dev server starts.

Run the following command when you're changing the source file in `embed/index.ts`.

```sh
yarn dev:rollup
```

> Currently, this only bundles and initializes [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) but could be used to render charts without iframes (using [custom elements](https://developers.google.com/web/fundamentals/web-components/customelements) or render to a generic DOM element) in the future.

#### Database migrations

Database migrations are run automatically when a production build of the app starts. In _development_, you'll have to run them manually:

```sh
yarn db:migrate:dev
```

Migrations are located in `db-migrations/`. Write SQL or JS migrations and follow the naming convention of the existing files `XXXXX-name-of-migration.{sql|js}`. Migrations are _immutable_, you will get an error if you change an already-run migration.

For detailed instructions, please refer to the [postgres-migrations](https://github.com/thomwright/postgres-migrations) documentation.

⚠️ On Vercel environments like "preview" and "production", "production" build are started which means that database migrations are executed.
Since all environments are sharing the same database, it means that a database migration executing on 1 database could be disruptive to
other preview deployments. For example adding a column to the schema would be disruptive, since other preview deployments would try to
remove it (since the column is not yet in the schema). To prevent any problems on preview deployments, we have a second database that
is special for development and that must be used if you are working on a branch that brings in database changes. You can configure
this in the Vercel environment variables by copy-pasting the environment variables found in the [visualization-tool-postgres-dev][]
storage (see `.env.local` tab), and copy paste them as [environment variables](https://vercel.com/ixt/visualization-tool/settings/environment-variables)
in the visualisation-project. Take care of scoping the new environment variables to the preview branch you are working on.
After merging the branch, you can delete the environment variables scoped to the branch.

[visualization-tool-postgres-dev](https://vercel.com/ixt/visualization-tool/stores/postgres/store_dV3rog1asOXO3BfC/data)

## Versioning

New versions of `package.json` are built on GitLab CI into a separate image that will be deployed to the integration env.

```sh
yarn version
```

This will prompt for a new version. The `postversion` script will automatically try to push the created version tag to the origin repository.

## Deployment

### Heroku

If a Heroku app is set up (as Git remote `heroku`), deploy with

```sh
git push heroku main -f
```

Build instructions are defined in `heroku.yml`.

For details, see https://devcenter.heroku.com/articles/build-docker-images-heroku-yml

### Abraxas

With your Abraxas credentials ...

1. Log in to https://uvek.abx-ras.ch/
2. This will prompt to open the F5 VPN client (you can download the client software once logged in). The VPN connection will be opened automatically.
3. Use [Microsoft Remote Desktop](https://apps.apple.com/us/app/microsoft-remote-desktop-10/id1295203466?mt=12) to log in to the Abraxas Jump Server:
   - Remote address: `192.168.99.9`
   - User: `cmb\<YOUR_USER_NAME>`
4. Once logged in, you should find yourself on a Windows desktop.
5. Using PuTTY (a terminal app on the desktop), connect to `cmbs0404.cmb.lan` via SSH. Again, use the same credentials.
6. Congrats, you are on the Abraxas dev server!

Useful commands to use:

- `cd /appl/run` -> go to the directory containing the `docker-compose.yml`
- `sudo /usr/local/bin/docker-compose logs web` -> display logs of the `web` service
- `sudo /usr/local/bin/docker-compose up -d` -> Rebuild services and restart after a configuration change
- `sudo /usr/local/bin/docker-compose pull web` -> Pull latest web image manually (should not be needed much)
- etc. (remember to use `sudo` for all Docker commands)

### Docker (anywhere)

To pull the latest image from the GitLab registry, run:

```sh
docker login registry.ldbar.ch -u <username> -p <deploy_token>

# Pull/Run manually
docker pull registry.ldbar.ch/interactivethings/visualization-tool:main
docker run -it registry.ldbar.ch/interactivethings/visualization-tool:main
```

Or use `docker-compose`. Simplified example `docker-compose.yml`:

```yaml
version: "3"
services:
  web:
    image: "registry.ldbar.ch/interactivethings/visualization-tool:main"
    ports:
      - "80:3000"
    restart: always
    env: DATABASE_URL=postgres://postgres@db:5432/visualization_tool
  db:
    image: "postgres:11"
    ports:
      - "5432:5432"
```

## Developing GitHub Actions

Several checks are run on different types of events that happen within the repository, including E2E or GraphQL performance tests. In order to be able to build and test the actions locally, we use [act](https://github.com/nektos/act), with example mocked event payloads defined in [this folder](https://github.com/visualize-admin/visualization-tool/tree/main/act).

After [installing](https://nektosact.com/installation/index.html) the library, you can run a given action like e.g. `act deployment_status -W ".github/workflows/performance-tests-pr.yml" -e act/deployment_status.json`, modifying the event payload or adding a new one as needed.

## E2E tests

Playwright is run on every successful deployment of a branch. Screenshots are made with Percy and sent directly to their cloud service for diffing.

A special [test page](http://localhost:3000/en/__test) shows all the charts that are screenshotted.
Those charts configurations are kept in the repository.

## GraphQL performance tests

The project uses a combination of [k6](https://k6.io) and [Grafana](https://grafana.com) with [Prometheus](https://k6.io/docs/results-output/real-time/prometheus-remote-write/) for GraphQL performance testing.

### Automation

To ensure constant monitoring of the performance of selected GraphQL queries, the performance tests are run [once an hour](https://github.com/visualize-admin/visualization-tool/blob/main/.github/workflows/performance-tests.yml) against each environment of the application. The results are then sent to the governmental Grafana dashboards.

### How to add or modify the tests

To add or modify the performance tests, go to the [k6/performance-tests](https://github.com/visualize-admin/visualization-tool/tree/main/k6/performance-tests) folder. The GitHub Action is generated by running the `yarn run github:codegen` command; be sure to run it after modifying the [generate-github-action.js](`https://github.com/visualize-admin/visualization-tool/blob/main/k6/performance-tests/generate-github-action.js`) file.

## Load tests

The project uses [k6](https://k6.io) for load testing.

### Automation

There is a [dedicated GitHub Action](https://github.com/visualize-admin/visualization-tool/actions/workflows/manual-load-test.yml) that runs the API load tests against selected environment.
You can investigate the results by going to Actions section in GitHub and checking the summary results. They are also visible in the cloud (k6.io), if you enable the cloud option.

### Local setup

In order to run the tests locally, follow the [documentation](https://k6.io/docs/get-started/installation/) to install `k6` on your machine.

### Running the tests locally

You might want to run the script locally, for example to be able to bypass the cloud limitations of k6 (e.g. max number of VUs bigger than 50). To run a given load test, simply run

```sh
k6 run k6/script-name.js
```

replacing the `script-name` with an actual name of the test you want to run. Optionally, you can tweak the configuration of each test
by directly modifying the `options` object inside a given script and running `yarn k6:codegen` to make the JavaScript files up-to-date.

For the GraphQL tests, you'll also need to pass `--env ENV=(test|int|prod)` flag to point to the proper environment and `--env ENABLE_GQL_SERVER_SIDE_CACHE=(true | false)` to control whether to use GQL server-side caching.

### Recording the tests using Playwright

While some tests are written manually, other tests come from HAR recordings that span a broad set of actions.
In order to record a HAR file and convert it into k6 script, use the `testAndSaveHar` inside `e2e/har-utils.ts` file.

Simply import that function inside a given e2e test and replace the regular `test` call with `testAndSaveHar`. Note that you need to
specify environment against which to run the test, filename and path to save the file.

> ⚠️ The `testAndSaveHar` function exposes a `baseUrl` property, which needs to be injected into the `page.goto` calls.

After the HAR file has been recorded, use [har-to-k6](https://k6.io/docs/test-authoring/create-tests-from-recordings/using-the-har-converter/#:~:text=The%20har%2Dto%2Dk6%20converter,to%20export%20recorded%20HTTP%20requests.) library to convert the file into k6 script (and put it into the `k6/har` folder). Remember to add `--add-sleep` flag to include pauses between requests. Afterwards, edit the `options` variable at the top of the file to set the parameters for the test.

> ⚠️ You might want to remove requests to Google afterwards manually, to remove false-positives of blocked requests.

## Authentication

Authentication is provided by the Swiss federal government's eIAM through ADFS.
We use Next-auth to integrate our application with it, through a [custom Provider](app/auth-providers/adfs.ts).

### Locally

You can use the ref eIAM. ADFS environment variables should be configured in your
`.env.local` file. You'll find those secret variables in our shared 1Password in
the "Visualize.admin .env.local" entry.
