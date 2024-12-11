import { Button, Typography } from "@mui/material";
import { useMemo } from "react";

import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { isLayouting } from "@/configurator/configurator-state";
import { useConfiguratorState } from "@/src";
import { assert } from "@/utils/assert";
import useEvent from "@/utils/use-event";

export const LayoutBlocksSelector = () => {
  const [state, dispatch] = useConfiguratorState(isLayouting);
  const { layout } = state;
  const { blocks } = layout;
  const activeBlock = useMemo(() => {
    const activeBlock = blocks.find(
      (block) => block.key === layout.activeField
    );

    if (activeBlock) {
      // For now we only support text blocks
      assert(activeBlock.type === "text", "Active block must be a text block");
    }

    return activeBlock;
  }, [blocks, layout.activeField]);
  const handleRemoveBlock = useEvent((key: string) => {
    dispatch({
      type: "LAYOUT_CHANGED",
      value: {
        ...layout,
        blocks: layout.blocks.filter((b) => b.key !== key),
      },
    });
    dispatch({ type: "LAYOUT_ACTIVE_FIELD_CHANGED", value: undefined });
  });

  return activeBlock ? (
    <div
      role="tabpanel"
      id={`control-panel-block-${activeBlock.key}`}
      aria-labelledby={`tab-block-${activeBlock.key}`}
      tabIndex={-1}
    >
      <ControlSection hideTopBorder>
        <SectionTitle>Text object</SectionTitle>
        <ControlSectionContent gap="none">
          <Button
            onClick={() => handleRemoveBlock(activeBlock.key)}
            sx={{ width: "fit-content" }}
          >
            <Typography>Remove object</Typography>
          </Button>
        </ControlSectionContent>
      </ControlSection>
    </div>
  ) : null;
};
