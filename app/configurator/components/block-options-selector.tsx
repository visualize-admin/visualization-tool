import { Trans } from "@lingui/macro";
import { Button, Typography } from "@mui/material";
import { useMemo } from "react";

import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { TextBlockInputField } from "@/configurator/components/field";
import { isLayouting } from "@/configurator/configurator-state";
import { useOrderedLocales } from "@/locales/use-locale";
import { useConfiguratorState } from "@/src";
import { assert } from "@/utils/assert";
import useEvent from "@/utils/use-event";

export const LayoutBlocksSelector = () => {
  const orderedLocales = useOrderedLocales();
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
        <SectionTitle>
          <Trans id="controls.section.block-options.block.text">
            Text object
          </Trans>
        </SectionTitle>
        <ControlSectionContent gap="none">
          {orderedLocales.map((locale) => (
            <TextBlockInputField key={locale} locale={locale} />
          ))}
        </ControlSectionContent>
      </ControlSection>
      <ControlSection>
        <ControlSectionContent>
          <Button
            onClick={() => handleRemoveBlock(activeBlock.key)}
            sx={{ width: "fit-content", mt: 5 }}
          >
            <Typography>Remove object</Typography>
          </Button>
        </ControlSectionContent>
      </ControlSection>
    </div>
  ) : null;
};
