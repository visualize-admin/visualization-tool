#!/usr/bin/env sh

# Builds and push the docker image to the registry
# The DOCKER_IMAGE_TAGS environment variable must be set and will
# be used to tag the image that is built.
# Multiple tags can be used and must be separated by spaces.

# Fail on error, fail if environment variable is not set, fail if pipe fails 
set -euo pipefail

# Logins to docker registry
docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

# Activates logging of the lines
set -x

# Build docker image, passing arguments defined in the CI 
docker build \
    --build-arg COMMIT=$CI_COMMIT_SHA \
    --build-arg MAPTILER_STYLE_KEY=$MAPTILER_STYLE_KEY \
    --build-arg VECTOR_TILE_URL=$VECTOR_TILE_URL \
    $(echo $DOCKER_IMAGE_TAGS | tr ' ' '\n' | xargs -n 1 -I {} echo "-t {}" ) .

# Push all the tags
docker push $DOCKER_IMAGE_TAGS
