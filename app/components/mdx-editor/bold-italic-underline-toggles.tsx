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
}: {
  format: FORMAT;
  iconName: IconName;
  formatName: TextFormatType;
}) => {
  const [currentFormat] = useCellValues(currentFormat$, iconComponentFor$);
  const applyFormat = usePublisher(applyFormat$);
  const active = (currentFormat & format) !== 0;

  return (
    <ToolbarIconButton
      onClick={() => {
        applyFormat(formatName);
      }}
      sx={{
        backgroundColor: active ? "grey.300" : "transparent",
        "&:hover": {
          backgroundColor: active ? "grey.300" : "grey.200",
        },
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
      <FormatButton format={IS_BOLD} iconName="bold" formatName="bold" />
      <FormatButton format={IS_ITALIC} iconName="italic" formatName="italic" />
      <FormatButton
        format={IS_UNDERLINE}
        iconName="underlined"
        formatName="underline"
      />
    </>
  );
};
