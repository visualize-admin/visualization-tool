import * as React from "react";
import { Box } from "theme-ui";
import { ScaleOrdinal } from "d3-scale";
import { LegendItem } from "../legends";

export const ColumnsTooltip = React.memo(
  ({ content }: { content: { x: string; y: number } }) => {
    return (
      <Box>
        {/* {Object.keys(content).map(c => (
          <> */}
        <Box>{content.x}</Box>
        <Box>{content.y}</Box>
        {/* </>
        ))} */}
      </Box>
    );
  }
);

export const ColumnsStackedTooltip = React.memo(
  ({
    content,
    colors,
    segments
  }: {
    content: $IntentionalAny;
    colors: ScaleOrdinal<string, string>;
    segments: string[];
  }) => {
    return (
      <Box>
        {segments.map(segment => (
          <LegendItem
            item={`${segment}: ${content[segment]}`}
            color={colors(segment)}
            symbol="square"
          ></LegendItem>
        ))}
      </Box>
    );
  }
);
