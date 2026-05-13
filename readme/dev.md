[back](../README.md)

# Development Environment

## Prerequisites

- To start a local PostgreSQL database you need
  [Docker](https://www.docker.com/) (i.e. Docker Compose).
- To run the application locally, you need [Node.js](https://nodejs.org/) with
  [Yarn](https://yarnpkg.com/):
  - You can either install Node.js/Yarn on your machine: we recommend to use
    [nvm](https://github.com/nvm-sh/nvm) to manage your Node.js version and
    execute `corepack enable` to install Yarn.
  - Or with [Nix](https://nixos.org), you can execute `nix-shell` and you're in
    a shell with Node.js and Yarn.

## Initial setup

1. Start the PostgreSQL database:

```sh
docker-compose up
```

2. Install dependencies, compile locales & migrate database:

```sh
yarn setup:dev
```

## Running tests

See [Testing Functional](testing-functional.md) and
[Testing Performance](testing-performance.md) for details on running tests.

## Start dev server

You can start the development server with:

```sh
yarn dev
```

The application will be available at http://localhost:3000.

> 👉 In [Visual Studio Code](https://code.visualstudio.com/), you can also run
> the **default build task** (CMD-SHIFT-B) to start the dev server, database
> server, and TypeScript checker (you'll need [Nix](https://nixos.org) for that
> to work).

### Debugging

To run the application with debugging enabled through VSCode, make sure the dev
server is running and then click the "Run and Debug" button in the sidebar
(CMD-SHIFT-D). Then select the "Launch Chrome" configuration. This will open a
new Chrome window with the dev tools open. You can now set breakpoints in the
code and they will be hit.

### SSL

When using authentication locally, you need to use SSL otherwise you'll
experience an error when the authentication provider redirects you back to the
app after login. You can either remove the trailing 's' in the URL after the
redirection, or use the

```sh
yarn dev:ssl
```

command to use HTTPS for the development server. Also, make sure to set the
`NEXTAUTH_URL` environment variable to `https://localhost:3000` in your
`.env.local` file. If you'd like to use `yarn e2e:ui:ssl` or `yarn e2e:dev:ssl`
in order to run tests locally on pages that are protected by authentication
please add `E2E_ENV=true` to your environment.

## Build the embed script (`/dist/embed.js`)

The embed script is not automatically built when the dev server starts.

Run the following command after changes to the `embed/index.ts` file:

```sh
yarn dev:rollup
```

> Currently, this only bundles and initializes
> [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) but could
> be used to render charts without iframes (using
> [custom elements](https://developers.google.com/web/fundamentals/web-components/customelements)
> or render to a generic DOM element) in the future.

## Database migrations

Database migrations are run automatically when a production build of the app
starts. In _development_, you'll have to run them manually:

```sh
yarn db:migrate:dev
```

> [!WARNING]
>
> On Vercel environments like "preview" and "production", database migrations
> are executed. Since all environments are sharing the same database, it means
> that a database migration executing on 1 database could be disruptive to other
> preview deployments. For example adding a column to the schema would be
> disruptive, since other preview deployments would try to remove it (since the
> column is not yet in the schema).
>
> To prevent any problems on preview deployments, we suggest setting up a
> second, dedicated database for development if you are working on a branch that
> brings in database changes. If you are using a service like Vercel, you can
> configure this in the corresponding environment variables. Take care of
> scoping the new environment variables to the preview branch you are working
> on. After merging the branch, you can delete the environment variables scoped
> to the branch.
