# Visualization Tool

## Development Environment

To start the development environment, you need a Docker runtime, e.g. [Docker Desktop](https://www.docker.com/products/docker-desktop).

Then, run:

```sh
docker-compose up
```

In [Visual Studio Code](https://code.visualstudio.com/), you also can run the **default build task** (CMD-SHIFT-B) to start TypeScript alongside Docker (you'll need [Nix](https://nixos.org) for that to work).

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
