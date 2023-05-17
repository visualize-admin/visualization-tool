#!/bin/bash

CLI=./bin/rdf-cube-view.js
ENDPOINT=https://test.lindas.admin.ch/query
GRAPH=https://lindas.admin.ch/elcom/electricityprice

#
# dimensions
#

# the cube-dimensions command can be used to discover cubes and list all dimensions
#$CLI cube-dimensions --endpoint=$ENDPOINT --graph=$GRAPH

# the cubes can be filtered by name...
#$CLI cube-dimensions --endpoint=$ENDPOINT --graph=$GRAPH --cube-name="Electricity tariff"

# ...or the full URL
#$CLI cube-dimensions --endpoint=$ENDPOINT --graph=$GRAPH --cube-url="https://energy.ld.admin.ch/elcom/energy-pricing/cube"

#
# observations
#

# list all observations as csv of the cube filtered by name
# DON'T RUN ME! 370000 observations....
#$CLI cube-observations --endpoint=$ENDPOINT --graph=$GRAPH --cube-name="Electricity tariff"

# filter the observations by period and municipality
$CLI cube-observations --endpoint=$ENDPOINT --graph=$GRAPH --cube-name="Electricity tariff" --filter="period;eq;2019;xsd:gYear" --filter="municipality;eq;http://classifications.data.admin.ch/municipality/58"
