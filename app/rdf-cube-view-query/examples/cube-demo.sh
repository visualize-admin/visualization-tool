#!/bin/bash

CLI=./bin/rdf-cube-view.js
ENDPOINT=http://ld.zazuko.com/query
GRAPH=http://ld.zazuko.com/cube-demo

#
# dimensions
#

# the cube-dimensions command can be used to discover cubes and list all dimensions
#$CLI cube-dimensions --endpoint=$ENDPOINT --graph=$GRAPH

# the cubes can be filtered by name...
#$CLI cube-dimensions --endpoint=$ENDPOINT --graph=$GRAPH --cube-name="Thermo"

# ...or the full URL
#$CLI cube-dimensions --endpoint=$ENDPOINT --graph=$GRAPH --cube-url="http://localhost:8080/rdf-cube-schema-example/temperature-sensor/cube"

#
# observations
#

# list all observations as csv of the cube filtered by name
#$CLI cube-observations --endpoint=$ENDPOINT --graph=$GRAPH --cube-name="Thermo"

# filter the dimensions based on cube dimension URL using string includes
#$CLI cube-observations --endpoint=$ENDPOINT --graph=$GRAPH --cube-name="Thermo" --dimension=date,temp

# now let's also filter the observations using the dimension URL filter, operation, argument and datatype separated by semicolon
#$CLI cube-observations --endpoint=$ENDPOINT --graph=$GRAPH --cube-name="Thermo" --dimension=date,temp --filter="date;gte;2019-01-08T12:00:00.017000+00:00;xsd:dateTime"
