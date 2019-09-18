import { Label } from "@rebass/forms";
import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { Box, Flex } from "rebass";

export const DSFilter = ({
  observations,
  namedDimensions
}: {
  observations: { results: any[] };
  namedDimensions: (string | Dimension)[][];
}) => {
  return (
    <>
      <h3>Filter Dimension</h3>
      {namedDimensions.map(dim => {
        return (
          <Flex mx={-2} mb={3}>
            <Box width={1 / 3} px={2}>
              <Label htmlFor={`select-${dim[0]}`}>{dim[0]}</Label>
              {/* <Select id={`select-${dim[0]}`} name={`select-${dim[0]}`}>
                {dimensionValues.map((dv: any) => (
                  <option>{dv}</option>
                ))}
              </Select> */}
            </Box>
          </Flex>
        );
      })}
    </>
  );
};

// const example = {
//   Holzartengruppe: {
//     value: { value: "http://example.org/pflanzungen/property/1/0" },
//     label: {
//       value: "Holzartengruppe - Total",
//       datatype: {
//         value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
//       },
//       language: "de"
//     }
//   },
//   Jahr: {
//     value: {
//       value: "1975",
//       datatype: { value: "http://www.w3.org/2001/XMLSchema#gYear" },
//       language: ""
//     },
//     label: {
//       value: "",
//       datatype: { value: "http://www.w3.org/2001/XMLSchema#string" },
//       language: ""
//     }
//   },
//   Variable: {
//     value: { value: "http://example.org/pflanzungen/property/0/0" },
//     label: {
//       value: "Anzahl Pflanzungen",
//       datatype: {
//         value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
//       },
//       language: "de"
//     }
//   },
//   Eigentümertyp: {
//     value: { value: "http://example.org/pflanzungen/property/2/0" },
//     label: {
//       value: "Eigentümertyp - Total",
//       datatype: {
//         value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
//       },
//       language: "de"
//     }
//   },
//   Forstzone: {
//     label: {
//       value: "Schweiz",
//       datatype: {
//         value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
//       },
//       language: "de"
//     },
//     value: { value: "http://example.org/pflanzungen/property/4/0" }
//   },
//   Kanton: {
//     label: {
//       value: "Schweiz",
//       datatype: {
//         value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
//       },
//       language: "de"
//     },
//     value: { value: "http://example.org/pflanzungen/property/3/0" }
//   },
//   measure: {
//     value: {
//       value: "14987.125",
//       datatype: { value: "http://www.w3.org/2001/XMLSchema#decimal" },
//       language: ""
//     }
//   }
// };
