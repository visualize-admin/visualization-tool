import { Trans } from "@lingui/macro";
import { useMemo } from "react";

import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ConfirmButton } from "@/configurator/components/confirm-button";
import { TextBlockInputField } from "@/configurator/components/field";
import { isLayouting } from "@/configurator/configurator-state";
import { useOrderedLocales } from "@/locales/use-locale";
import { useConfiguratorState } from "@/src";
import { assert } from "@/utils/assert";
import { useEvent } from "@/utils/use-event";

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
      type: "LAYOUT_ACTIVE_FIELD_CHANGE",
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
          <ConfirmButton onClick={handleClosePanel} />
        </ControlSectionContent>
      </ControlSection>
    </div>
  ) : null;
};
