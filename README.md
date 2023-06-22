# Visualization Tool

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
```

> 👉 In [Visual Studio Code](https://code.visualstudio.com/), you also can run the **default build task** (CMD-SHIFT-B) to start the dev server, database server, and TypeScript checker (you'll need [Nix](https://nixos.org) for that to work).

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

Database migrations are run automatically when the _production_ app starts. In _development_, you'll have to run them manually:

```sh
yarn db:migrate:dev
```

Migrations are located in `db-migrations/`. Write SQL or JS migrations and follow the naming convention of the existing files `XXXXX-name-of-migration.{sql|js}`. Migrations are _immutable_, you will get an error if you change an already-run migration.

For detailed instructions, please refer to the [postgres-migrations](https://github.com/thomwright/postgres-migrations) documentation.

## Versioning

New versions of `package.json` are built on GitLab CI into a separate image that will be deployed to the integration env.

```sh
yarn version
```

This will prompt for a new version. The `postversion` script will automatically try to push the created version tag to the origin repo.

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

## E2E tests

Cypress is run on every PR. Screenshots are made and compared with screenshots that are saved in the repository.
If a difference is detected, the tests will fail.

A special [test page](http://localhost:3000/en/__test) shows all the charts that are screenshotted by Cypress.
Those charts configurations are kept in the repository.

At the moment, the screenshots are made from charts using data from int.lindas.admin.ch as for some functionalities, we do not
yet have production data.

## Load tests

The project uses [k6](https://k6.io) for load testing.

### Automation

There is a dedicated GitHub action that runs the API load tests against https://test.visualize.admin.ch on push to the `main` branch.
You can investigate the results by going to Actions section in GitHub and checking the summary results.

It's also possible to run the load tests manually by clicking a `Run workflow` button inside [k6 Load Test (Test)](https://github.com/visualize-admin/visualization-tool/actions/workflows/load-test.yml).

### Local setup

In order to run the tests locally, follow the [documentation](https://k6.io/docs/get-started/installation/) to install `k6` on your machine.

Some tests are written in TypeScript and need to be compiled to JavaScript before running. In order to make the conversion, run

```sh
yarn k6:codegen
```

The scripts will be generated in k6 directory of the app.

### Running the tests

To run a given load test, simply run

```sh
k6 run k6/script-name.js
```

replacing the `script-name` with an actual name of the test you want to run. Optionally, you can tweak the configuration of each test
by directly modifying the `options` object inside a given script and running `yarn k6:codegen` to make the JavaScript files up-to-date.

### Recording the tests using Playwright

While some tests are written manually (TypeScript files compiled into JavaScript), other tests come from HAR recordings that span a broad
set of actions. In order to record a HAR file and convert it into k6 script, use the `testAndSaveHar` inside `e2e/har-utils.ts` file.

Simply import that function inside a given e2e test and replace the regular `test` call with `testAndSaveHar`. Note that you need to
specify environment against which to run the test, filename and path to save the file.

> ⚠️ The `testAndSaveHar` function exposes a `baseUrl` property, which needs to be injected into the `page.goto` calls.

After the HAR file has been recorded, use [har-to-k6](https://k6.io/docs/test-authoring/create-tests-from-recordings/using-the-har-converter/#:~:text=The%20har%2Dto%2Dk6%20converter,to%20export%20recorded%20HTTP%20requests.) library to convert the file into k6 script (and put it into the `k6/har` folder).

## Authentication

Authentication by eIAM through a Keycloak instance.
We use Next-auth to integrate our application with Keycloak.
See https://next-auth.js.org/providers/keycloak for documentation.

### Locally

The easiest way is to run Keycloak via Docker.

```
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:19.0.3 start-dev
```

⚠️ After creating the container via the above command, if you stop it, restart the container via the docker UI so that you re-use the
same storage, otherwise you'll have to reconfigure Keycloak.

To configure Keycloak:

- Access the [Keycloak admin][keycloak-admin] (login, password: "admin", "admin")
- Create client application
  - Via import: [Keycloak][keycloak-admin] > Clients > Import client
    - Use the exported client `keycloak-visualize-client-dev.json`
  - Manually: [Keycloak][keycloak-admin] > Clients > Create client
    - id: "visualize"
    - Choose OpenIDConnect
    - In next slide, toggle "Client Authentication" on
    - Configure redirect URI on client
      - Root URL: `http://localhost:3000`
      - Redirect URI: `/api/auth/callback/keycloak`
- Create a user
  - Set a password to the user (in Credentials tab)
- Set environment variables in `.env.local`
  - KEYCLOAK_ID: "visualize"
  - KEYCLOAK_SECRET: From [Keycloak][keycloak-admin] > Clients > visualize > Credentials > Client secret
  - KEYCLOAK_ISSUER: http://localhost:8080/realms/master

[keycloak-admin]: http://localhost:8080/admin/master/console/#/
