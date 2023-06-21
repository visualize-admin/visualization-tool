import { Paper } from "@mui/material";
import { markdown, ReactSpecimen } from "catalog";

import { PreviewTable } from "@/browse/datatable";
import observations from "@/test/__fixtures/data/bathingsite-observations.json";

export default () => {
  return markdown`

PreviewTable is used to show a preview of the datasets.

${(
  <ReactSpecimen>
    <Paper>
      <PreviewTable
        title="My dataset preview"
        /**
         // @ts-ignore */
        headers={observations["data"]["dataCubeByIri"]["dimensions"]}
        observations={observations["data"]["dataCubeByIri"]["observations"][
          "data"
        ].slice(0, 10)}
      />
    </Paper>
  </ReactSpecimen>
)}
`;
};
