#!/bin/sh

docker-compose exec db createdb -U postgres visualization_tool;
docker-compose exec db psql -U postgres -d visualization_tool -f /usr/src/db/setup.sql;