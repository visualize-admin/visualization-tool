# Visualization Tool

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
git push heroku master -f
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
docker pull registry.ldbar.ch/interactivethings/visualization-tool:master
docker run -it registry.ldbar.ch/interactivethings/visualization-tool:master
```

Or use `docker-compose`. Simplified example `docker-compose.yml`:

```yaml
version: "3"
services:
  web:
    image: "registry.ldbar.ch/interactivethings/visualization-tool:master"
    ports:
      - "80:3000"
    restart: always
    env: DATABASE_URL=postgres://postgres@db:5432/visualization_tool
  db:
    image: "postgres:11"
    ports:
      - "5432:5432"
```
