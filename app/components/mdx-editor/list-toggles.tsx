import { applyListType$, currentListType$ } from "@mdxeditor/editor";
import { useCellValues, usePublisher } from "@mdxeditor/gurx";

import { ToolbarIconButton } from "@/components/mdx-editor/common";
import { Icon, IconName } from "@/icons";

const ListTypeButton = ({
  listType,
  iconName,
}: {
  listType: "bullet" | "number";
  iconName: IconName;
}) => {
  const [currentListType] = useCellValues(currentListType$);
  const applyListType = usePublisher(applyListType$);
  const active = currentListType === listType;

  return (
    <ToolbarIconButton
      onClick={() => {
        applyListType(active ? "" : listType);
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

export const ListToggles = () => {
  return (
    <>
      <ListTypeButton listType="bullet" iconName="listBullet" />
      <ListTypeButton listType="number" iconName="listNumber" />
    </>
  );
};
