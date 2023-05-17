#!/bin/bash

CLI=./bin/rdf-cube-view.js
ENDPOINT=https://int.lindas.admin.ch/query
GRAPH=https://lindas.admin.ch/foen/cube

#
# dimensions
#

# the cube-dimensions command can be used to discover cubes and list all dimensions
$CLI cube-dimensions --endpoint=$ENDPOINT --graph=$GRAPH

#
# observations
#

# list all observations as csv of the cube filtered by name
$CLI cube-observations --endpoint=$ENDPOINT --graph=$GRAPH --cube-name="UBD28 Annual Means" 
