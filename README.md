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

#### Database migrations

Database migrations are run automatically when the *production* app starts. In *development*, you'll have to run them manually:

```sh
yarn db:migrate:dev
```

Migrations are located in `db-migrations/`. Write SQL or JS migrations and follow the naming convention of the existing files `XXXXX-name-of-migration.{sql|js}`. Migrations are _immutable_, you will get an error if you change an already-run migration.

For detailed instructions, please refer to the [postgres-migrations](https://github.com/thomwright/postgres-migrations) documentation.

## Docker Deployment

To pull the latest image from the GitLab registry, run:

```sh
docker login registry.ldbar.ch -u <username> -p <deploy_token>

# Pull/Run manually
docker pull registry.ldbar.ch/interactivethings/visualization-tool:master
docker run -it registry.ldbar.ch/interactivethings/visualization-tool:master
```

Or use `docker-compose`. Simple example `docker-compose.yml`:

```yaml
version: "3"
services:
  web:
    image: "registry.ldbar.ch/interactivethings/visualization-tool:master"
    ports:
      - "80:3000"
    restart: always
```
