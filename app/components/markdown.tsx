import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import {
  activePlugins$,
  allowedHeadingLevels$,
  BlockType,
  convertSelectionToNode$,
  currentBlockType$,
} from "@mdxeditor/editor";
import { useCellValue, usePublisher } from "@mdxeditor/gurx";
import {
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  useEventCallback,
} from "@mui/material";
import { $createParagraphNode } from "lexical";
import { ComponentProps, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { Icon } from "@/icons";

const components: ComponentProps<typeof ReactMarkdown>["components"] = {
  // TODO: Maybe can be handled by Title and Description components?
  h1: ({ children, style, ...props }) => (
    <h1 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, style, ...props }) => (
    <h2 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, style, ...props }) => (
    <h3 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, style, ...props }) => (
    <h4 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, style, ...props }) => (
    <h5 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, style, ...props }) => (
    <h6 style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </h6>
  ),
  p: ({ children, style, ...props }) => (
    <p style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </p>
  ),
  a: ({ children, style, ...props }) => (
    <a style={{ ...style, marginTop: 0 }} {...props}>
      {children}
    </a>
  ),
};

export const Markdown = (
  props: Omit<ComponentProps<typeof ReactMarkdown>, "components">
) => {
  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      {...props}
    />
  );
};

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
      case "quote":
        convertSelectionToNode(() => $createQuoteNode());
        break;
      case "paragraph":
        convertSelectionToNode(() => $createParagraphNode());
        break;
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
        sx={{ p: "2px", borderRadius: 4 }}
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
        sx={{ transform: "translate(-12px, 8px)" }}
        MenuListProps={{ sx: { py: 0 } }}
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
