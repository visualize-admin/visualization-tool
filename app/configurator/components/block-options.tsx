import { Box } from "@mui/material";
import { useMemo } from "react";

import { isLayouting } from "@/configurator/configurator-state";
import { useConfiguratorState } from "@/src";

export const LayoutBlocksSelector = () => {
  const [state, _] = useConfiguratorState(isLayouting);
  const { layout } = state;
  const { blocks } = layout;
  const activeBlock = useMemo(() => {
    return blocks.find((block) => block.key === layout.activeField);
  }, [blocks, layout.activeField]);

  return (
    <Box sx={{ p: 3 }}>{activeBlock ? activeBlock.key : "No active block"}</Box>
  );
};
