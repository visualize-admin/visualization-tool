library(jsonlite)
library(tidyverse)

# Simple dataset
simple <- read.csv("raw/holzernte-simple.csv") %>% toJSON(pretty = T)
write(simple, "tidy/holzernte-simple.json")

# dataset with all dimensions
raw <- read.csv("raw/Holzernte der Schweiz, in m3 nach Jahr, Forstzone, Kanton, Eigentümertyp, Holzartengruppe und Beobachtungseinheit.csv",
                na.strings = "")

# Fill in values that are not repeated
# to see all column names: names(raw)
data <- raw %>% fill(Jahr, Forstzone_id, Forstzone, Kanton_id, Kanton, Eigentümertyp_id, Eigentümertyp)

# Rename column names to include a tag for dimension types
# D_ for dimensions (categorical variables)
# M_ for measures (quantitative variables)
# Also remove uneeded columns
# use Kanton Id as global id.
data <- data %>% select(id = Kanton_id, 
                        D_Jahr = Jahr, 
                        # D_Forstone_id = Forstzone_id, 
                        D_Forstzone = Forstzone, 
                        D_Kanton = Kanton,
                        # D_Eigentümertyp_id = Eigentümertyp_id, 
                        D_Eigentümertyp = Eigentümertyp,
                        #D_Holzartengruppe_id = Holzartengruppe_id,
                        D_Holzartengruppe = Holzartengruppe,
                        M_Holzernte.Total = Holzernte...Total,
                        M_Stammholz = Stammholz,
                        M_Industrieholz = Industrieholz,
                        M_Energieholz.Total = Energieholz...Total,
                        M_Stück.Energieholz = X...Stück.Energieholz,
                        M_X...Hack.Energieholz = X...Hack.Energieholz,
                        M_Übrige.Sortimente = Übrige.Sortimente)

json <- toJSON(data)

write(json, "tidy/holzernte.json")
