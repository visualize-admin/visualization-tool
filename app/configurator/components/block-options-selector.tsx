import { Trans } from "@lingui/macro";
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

export const LayoutBlocksSelector = () => {
  const orderedLocales = useOrderedLocales();
  const [state] = useConfiguratorState(isLayouting);
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

  return activeBlock ? (
    <div
      key={activeBlock.key}
      role="tabpanel"
      id={`control-panel-block-${activeBlock.key}`}
      aria-labelledby={`tab-block-${activeBlock.key}`}
      tabIndex={-1}
    >
      <ControlSection>
        <SectionTitle closable>
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
    </div>
  ) : null;
};
