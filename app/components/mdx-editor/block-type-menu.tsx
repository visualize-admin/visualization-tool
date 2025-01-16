import { $createHeadingNode } from "@lexical/rich-text";
import {
  activePlugins$,
  allowedHeadingLevels$,
  BlockType,
  convertSelectionToNode$,
  currentBlockType$,
  useCellValue,
  usePublisher,
} from "@mdxeditor/editor";
import {
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  useEventCallback,
} from "@mui/material";
import { $createParagraphNode } from "lexical";
import { useState } from "react";

import { Icon } from "@/icons";

/**
 * Based on https://github.com/mdx-editor/editor/blob/main/src/plugins/toolbar/components/BlockTypeSelect.tsx
 * */
export const BlockTypeMenu = () => {
  const convertSelectionToNode = usePublisher(convertSelectionToNode$);
  const currentBlockType = useCellValue(currentBlockType$);
  const activePlugins = useCellValue(activePlugins$);
  const hasHeadings = activePlugins.includes("headings");

  const handleChange = useEventCallback((blockType: BlockType) => {
    switch (blockType) {
      case "paragraph":
        convertSelectionToNode(() => $createParagraphNode());
        break;
      case "quote":
      case "":
        break;
      default:
        if (blockType.startsWith("h")) {
          convertSelectionToNode(() => $createHeadingNode(blockType));
        } else {
          throw new Error(`Unknown block type: ${blockType}`);
        }
    }
  });

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const handleClose = useEventCallback(() => setAnchor(null));

  if (!hasHeadings) {
    return null;
  }

  type Item = { label: string | JSX.Element; value: BlockType };
  const items: Item[] = [
    {
      label: "Paragraph",
      value: "paragraph",
    },
  ];

  if (hasHeadings) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const allowedHeadingLevels = useCellValue(allowedHeadingLevels$);
    items.push(
      ...allowedHeadingLevels.map(
        (n) =>
          ({
            label: `Heading ${n}`,
            value: `h${n}`,
          }) as const
      )
    );
  }

  return (
    <>
      <IconButton
        onClick={(e) => {
          setAnchor(e.currentTarget);
        }}
        style={{ padding: "2px", borderRadius: 4 }}
      >
        <Icon name="fontSize" />
      </IconButton>
      <Menu
        open={!!anchor}
        anchorEl={anchor}
        onClose={(e) => {
          // @ts-ignore this is correct
          e.stopPropagation();
          handleClose();
        }}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        style={{ transform: "translate(-12px, 8px)" }}
        MenuListProps={{ style: { padding: 0 } }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.value}
            onClick={() => {
              handleChange(item.value);
              handleClose();
            }}
            sx={{ py: 3 }}
          >
            <ListItemText>
              <Typography
                fontWeight={currentBlockType === item.value ? "bold" : "normal"}
              >
                {item.label}
              </Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
