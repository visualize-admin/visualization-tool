import { Box, useMediaQuery } from "@mui/material";
import { useMemo } from "react";

import { ChartPanelLayoutTypeProps } from "@/components/chart-panel";
import classes from "@/components/chart-panel-layout-tall.module.css";
import { LayoutBlock } from "@/config-types";
import { useTheme } from "@/themes";

export const ChartPanelLayoutTall = ({
  blocks,
  renderBlock,
}: ChartPanelLayoutTypeProps) => {
  const rows = useMemo(() => {
    return getChartPanelLayoutTallRows({ blocks, renderBlock });
  }, [blocks, renderBlock]);

  return (
    <>
      {rows.map((row, i) => (
        <ChartPanelLayoutTallRow key={i} row={row} />
      ))}
    </>
  );
};

const ChartPanelLayoutTallRow = ({ row }: { row: ChartPanelLayoutTallRow }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  switch (row.type) {
    case "wide":
      return row.renderBlock(row.block);
    case "narrow":
      if (isMobile) {
        return <>{row.blocks.map(row.renderBlock)}</>;
      }

      return (
        <Box className={classes.root}>{row.blocks.map(row.renderBlock)}</Box>
      );
  }
};
type ChartPanelLayoutTallRow = {
  renderBlock: (block: LayoutBlock) => JSX.Element;
} & (
  | {
      type: "wide";
      block: LayoutBlock;
    }
  | {
      type: "narrow";
      blocks: [LayoutBlock] | [LayoutBlock, LayoutBlock];
    }
);

const getChartPanelLayoutTallRows = ({
  blocks,
  renderBlock,
}: ChartPanelLayoutTypeProps): ChartPanelLayoutTallRow[] => {
  const rows: ChartPanelLayoutTallRow[] = [];

  for (let i = 0; i < blocks.length; i += 1) {
    if (i % 3 === 0) {
      rows.push({
        type: "wide",
        block: blocks[i],
        renderBlock,
      });
    }

    if (i % 3 === 1) {
      const block = blocks[i];
      const nextBlock = blocks[i + 1];
      rows.push({
        type: "narrow",
        blocks: nextBlock ? [block, nextBlock] : [block],
        renderBlock,
      });
    }
  }

  return rows;
};
