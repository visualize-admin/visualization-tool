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

  const handleClosePanel = useEvent(() => {
    dispatch({
      type: "LAYOUT_ACTIVE_FIELD_CHANGED",
      value: undefined,
    });
  });

  return activeBlock ? (
    <div
      key={activeBlock.key}
      role="tabpanel"
      id={`control-panel-block-${activeBlock.key}`}
      aria-labelledby={`tab-block-${activeBlock.key}`}
      tabIndex={-1}
    >
      <ControlSection hideTopBorder>
        <SectionTitle closable>
          <Trans id="controls.section.block-options.block.text">
            Text object
          </Trans>
        </SectionTitle>
        <ControlSectionContent>
          {orderedLocales.map((locale) => (
            <TextBlockInputField key={locale} locale={locale} />
          ))}
          <Button
            size="sm"
            onClick={handleClosePanel}
            sx={{ alignSelf: "flex-end", mt: 2, px: 5 }}
          >
            <Typography component="span">Ok</Typography>
          </Button>
        </ControlSectionContent>
      </ControlSection>
    </div>
  ) : null;
};
