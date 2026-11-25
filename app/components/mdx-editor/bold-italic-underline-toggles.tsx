import { t } from "@lingui/macro";
import {
  applyFormat$,
  currentFormat$,
  FORMAT,
  iconComponentFor$,
  IS_BOLD,
  IS_ITALIC,
  IS_UNDERLINE,
} from "@mdxeditor/editor";
import { useCellValues, usePublisher } from "@mdxeditor/gurx";
import { TextFormatType } from "lexical";

import { ToolbarIconButton } from "@/components/mdx-editor/common";
import { Icon, IconName } from "@/icons";

const FormatButton = ({
  format,
  iconName,
  formatName,
  label,
}: {
  format: FORMAT;
  iconName: IconName;
  formatName: TextFormatType;
  label: string;
}) => {
  const [currentFormat] = useCellValues(currentFormat$, iconComponentFor$);
  const applyFormat = usePublisher(applyFormat$);
  const active = (currentFormat & format) !== 0;

  return (
    <ToolbarIconButton
      label={label}
      active={active}
      onClick={() => {
        applyFormat(formatName);
      }}
    >
      <Icon name={iconName} />
    </ToolbarIconButton>
  );
};

/**
 * Based on https://github.com/mdx-editor/editor/blob/main/src/plugins/toolbar/components/BoldItalicUnderlineToggles.tsx
 */
export const BoldItalicUnderlineToggles = () => {
  return (
    <>
      <FormatButton
        format={IS_BOLD}
        iconName="bold"
        formatName="bold"
        label={t({ id: "mdx-editor.toolbar.bold", message: "Bold" })}
      />
      <FormatButton
        format={IS_ITALIC}
        iconName="italic"
        formatName="italic"
        label={t({ id: "mdx-editor.toolbar.italic", message: "Italic" })}
      />
      <FormatButton
        format={IS_UNDERLINE}
        iconName="underlined"
        formatName="underline"
        label={t({ id: "mdx-editor.toolbar.underline", message: "Underline" })}
      />
    </>
  );
};
