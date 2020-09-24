library(jsonlite)
library(tidyverse)

roteliste <- read.csv("rote-listen-with-labels.csv")
json <- toJSON(roteliste)
write(json,"rote-listen-with-labels.json", row.names=FALSE)
