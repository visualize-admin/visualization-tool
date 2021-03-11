import * as React from "react";

import { Box } from "theme-ui";
import { ChartMapVisualization } from "../../charts/map/chart-map-prototype";
import { AppLayout } from "../../components/layout";

function Map() {
  return (
    <AppLayout>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            "minmax(12rem, 20rem) minmax(22rem, 1fr) minmax(12rem, 20rem)",

          width: "100%",
          position: "fixed",
          // FIXME replace 96px with actual header size
          top: "96px",
          height: "calc(100vh - 96px)",
        }}
      >
        <ChartMapVisualization />
      </Box>
    </AppLayout>
  );
}

export default Map;
