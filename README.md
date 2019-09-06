# Visualization Tool

## Docker Deployment

To pull the latest image from the GitLab registry, run:

```
docker login registry.ldbar.ch -u <username> -p <deploy_token>

docker pull registry.ldbar.ch/interactivethings/visualization-tool:master

docker run -it registry.ldbar.ch/interactivethings/visualization-tool:master
```
