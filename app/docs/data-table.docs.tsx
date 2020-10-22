import { Box } from "@theme-ui/components";
import { markdown, ReactSpecimen } from "catalog";
import * as React from "react";
import { BarCell, TagCell, TextCell } from "../charts/table/cell";

export const Docs = () => markdown`

## Data Table

### Cell as text

  ${(
    <>
      <ReactSpecimen span={2}>
        <TextCell
          value="Ticino"
          styles={{
            color: "#333333",
            bg: "#F5F5F5",
            textAlign: "left",
            fontWeight: "regular",
          }}
        />
      </ReactSpecimen>
      <ReactSpecimen span={2}>
        <TextCell
          value="Aargau"
          styles={{
            color: "primary",
            bg: "#F5F5F5",
            textAlign: "left",
            fontWeight: "bold",
          }}
        />
      </ReactSpecimen>
      <ReactSpecimen span={2}>
        <TextCell
          value="Alpen-Südseite"
          styles={{
            color: "#333333",
            bg: "successLight",
            textAlign: "left",
            fontWeight: "regular",
          }}
        />
      </ReactSpecimen>
    </>
  )}

  ### Cell as Tag

  ${(
    <>
      <ReactSpecimen span={2}>
        <TagCell
          value="Ticino"
          tagColor="alertLight"
          styles={{
            color: "monochrome900",
            fontWeight: "regular",
          }}
        />
      </ReactSpecimen>
      <ReactSpecimen span={2}>
        <TagCell
          value="Aargau"
          tagColor="primaryLight"
          styles={{
            color: "monochrome900",
            fontWeight: "bold",
          }}
        />
      </ReactSpecimen>
      <ReactSpecimen span={2}>
        <TagCell
          value="Alpen-Südseite"
          tagColor="successLight"
          styles={{
            color: "monochrome900",
            fontWeight: "regular",
          }}
        />
      </ReactSpecimen>
    </>
  )}


  ### Cell as Bar
  ${(
    <>
      <ReactSpecimen span={2}>
        <Box sx={{ "> td": { width: 150 } }}>
          <BarCell
            value="60'758"
            barColor="alert"
            barBackground="monochrome300"
            barWidth={60}
          />
        </Box>
      </ReactSpecimen>
      <ReactSpecimen span={2}>
        <Box sx={{ "> td": { width: 150 } }}>
          <BarCell
            value="42'456"
            barColor="primary"
            barBackground="primaryLight"
            barWidth={40}
          />
        </Box>
      </ReactSpecimen>
      <ReactSpecimen span={2}>
        <Box sx={{ "> td": { width: 150 } }}>
          <BarCell
            value="90'439"
            barColor="success"
            barBackground="successLight"
            barWidth={90}
          />
        </Box>
      </ReactSpecimen>
    </>
  )}

`;
export default Docs;
