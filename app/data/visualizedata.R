library(jsonlite)
library(tidyverse)

roteliste <- read.csv("rote-listen-with-labels.csv")
json <- toJSON(roteliste, row.names=FALSE)
write(json,"rote-listen-with-labels.json")

h <- read.csv("holzernte.csv")
h_json <- toJSON(h, row.names=FALSE)
write(h_json,"holzernte.json")
