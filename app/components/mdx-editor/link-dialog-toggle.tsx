import { t } from "@lingui/macro";
import { usePublisher } from "@mdxeditor/gurx";

import { ToolbarIconButton } from "@/components/mdx-editor/common";
import { openLinkEditDialog$ } from "@/components/mdx-editor/link-dialog";
import { Icon } from "@/icons";

export const LinkDialogToggle = () => {
  const openLinkEditDialog = usePublisher(openLinkEditDialog$);

  return (
    <ToolbarIconButton
      label={t({ id: "mdx-editor.toolbar.link", message: "Link" })}
      onClick={() => {
        openLinkEditDialog();
      }}
    >
      <Icon name="link" />
    </ToolbarIconButton>
  );
};
