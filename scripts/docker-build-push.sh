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
    --label "COMMIT=$CI_COMMIT_SHA" \
    --label "TAGS=$DOCKER_IMAGE_TAGS" \
    --build-arg COMMIT=$CI_COMMIT_SHA \
    --build-arg MAPTILER_STYLE_KEY=$MAPTILER_STYLE_KEY \
    --build-arg VECTOR_TILE_URL=$VECTOR_TILE_URL \
    --build-arg ADFS_ID=$ADFS_ID \
    --build-arg ADFS_ISSUER=$ADFS_ISSUER \
    --build-arg ADFS_PROFILE_URL=$ADFS_PROFILE_URL \
    --build-arg NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
    --build-arg NEXTAUTH_URL=$NEXTAUTH_URL \
    $(echo $DOCKER_IMAGE_TAGS | tr ' ' '\n' | xargs -n 1 -I {} echo "-t {}" ) .

# Push all the tags
echo $DOCKER_IMAGE_TAGS | xargs -n 1 docker push
