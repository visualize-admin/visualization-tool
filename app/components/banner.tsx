import { Trans } from "@lingui/react";
import { Box } from "@mui/material";

import { HintYellow } from "@/components/hint";

import { useChartState } from "../charts/shared/chart-state";

/**
 * Banner to display errors or warnings for a chart. Each chart type can have specific warnings or errors depending on the data.
 *
 * @returns React.ReactNode | null
 */
export const Banner = () => {
  const state = useChartState();

  switch (state.chartType) {
    case "area":
      const someValueIsNegative = state.allData.some(
        (d) => +(state.getY(d) || 0) < 0
      );
      if (someValueIsNegative)
        return (
          <Box sx={{ mb: 4 }}>
            <HintYellow iconName="datasetError" iconSize={64}>
              <Trans id="dataset.error.negative-values">
                Careful, this dataset contains negative values and might not
                display correctly with this chart type.
                <br />
                <strong>Try using another chart type.</strong>
              </Trans>
            </HintYellow>
          </Box>
        );
    default:
      return null;
  }
};
