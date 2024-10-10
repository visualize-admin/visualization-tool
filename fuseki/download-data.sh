#!/bin/bash

BASE_URL=https://stardog.cluster.ldbar.ch/lindas
curl -G "${BASE_URL}" \
    --data-urlencode "graph=https://lindas.admin.ch/foen/cube" \
    --user public:public \
    -o foen-cube.ttl
