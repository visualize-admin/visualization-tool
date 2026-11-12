import { t } from "@lingui/macro";
import { applyListType$, currentListType$ } from "@mdxeditor/editor";
import { useCellValues, usePublisher } from "@mdxeditor/gurx";

import { ToolbarIconButton } from "@/components/mdx-editor/common";
import { Icon, IconName } from "@/icons";

const ListTypeButton = ({
  listType,
  iconName,
  label,
}: {
  listType: "bullet" | "number";
  iconName: IconName;
  label: string;
}) => {
  const [currentListType] = useCellValues(currentListType$);
  const applyListType = usePublisher(applyListType$);
  const active = currentListType === listType;

  return (
    <ToolbarIconButton
      label={label}
      active={active}
      onClick={() => {
        applyListType(active ? "" : listType);
      }}
    >
      <Icon name={iconName} />
    </ToolbarIconButton>
  );
};

export const ListToggles = () => {
  return (
    <>
      <ListTypeButton
        listType="bullet"
        iconName="listBullet"
        label={t({
          id: "mdx-editor.toolbar.bullet-list",
          message: "Bulleted list",
        })}
      />
      <ListTypeButton
        listType="number"
        iconName="listNumber"
        label={t({
          id: "mdx-editor.toolbar.number-list",
          message: "Numbered list",
        })}
      />
    </>
  );
};
