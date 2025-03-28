import { Trans } from "@lingui/macro";
import MUITreeItem, {
  TreeItemContentClassKey,
  TreeItemProps,
  useTreeItem,
} from "@mui/lab/TreeItem";
import TreeView, { TreeViewProps } from "@mui/lab/TreeView";
import {
  Box,
  Collapse,
  IconButton,
  OutlinedInput,
  Popover,
  PopoverActions,
  TextField,
  TextFieldProps,
  Theme,
  Typography,
  useEventCallback,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Label } from "@/components/form";
import { HierarchyValue } from "@/domain/data";
import { Icon } from "@/icons";
import SvgIcChevronDown from "@/icons/components/IcChevronDown";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import { flattenTree, pruneTree } from "@/rdf/tree-utils";
import useEvent from "@/utils/use-event";

const useStyles = makeStyles<Theme, { disabled?: boolean; open?: boolean }>(
  (theme) => ({
    input: {
      width: "100%",
      cursor: "pointer",
      borderRadius: 4,
      fontSize: theme.typography.body2.fontSize,
      minHeight: 40,

      "& input": {
        cursor: "pointer",
      },
    },
    icon: {
      flexShrink: 0,
      marginRight: -6,
      width: 20,
      height: 20,
      color: ({ disabled }) =>
        disabled ? theme.palette.grey[500] : theme.palette.grey[600],
      transition: "transform 0.150s ease",
      transform: ({ open }) => (open ? "rotate(180deg)" : "rotate(0deg)"),
    },
  })
);

const useTreeItemStyles = makeStyles<Theme>((theme) => ({
  label: {
    display: "flex",
    fontSize: theme.typography.body2.fontSize,

    [theme.breakpoints.up("xs")]: {
      "&": {
        fontSize: theme.typography.body2.fontSize,
      },
    },
  },
  // Necessary to use $content below
  content: {},
  root: {
    "&:hover > div > $iconContainer": {
      opacity: 1,
    },
    "--depth": 1,
    "& &": {
      "--depth": 2,
    },
    "& & &": {
      "--depth": 3,
    },
    "& & & &": {
      "--depth": 4,
    },
    "& & & & &": {
      "--depth": 5,
    },
    "& $content": {
      paddingLeft: "calc(var(--depth) * 10px)",
    },
  },
  iconContainer: {
    opacity: 0.5,
  },
  group: {
    // The padding is done on the content inside the row for the hover
    // effect to extend until the edge of the popover
    marginLeft: 0,
  },
}));

const useCustomTreeItemStyles = makeStyles<
  Theme,
  {
    selectable?: boolean;
  }
>((theme) => ({
  action: {
    color: theme.palette.text.primary,
    opacity: 0.5,
    marginLeft: "1rem",
    "&:hover": {
      opacity: 1,
      color: theme.palette.primary.main,
    },
    transform: "translateX(0)",
    transition: "transform 0.3s ease, opacity 0.3s ease",
  },
  root: {
    "&:hover": {
      "& $action": {
        transform: "translateX(0)",
      },
    },
  },
  checkIcon: {
    marginLeft: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
}));

const TreeItemContent = forwardRef<
  unknown,
  {
    classes: Record<TreeItemContentClassKey, string>;
    className?: string;
    displayIcon?: React.ReactNode;
    expansionIcon?: React.ReactNode;
    icon?: React.ReactNode;
    label?: React.ReactNode;
    onClick?: React.MouseEventHandler;
    nodeId: string;
    onMouseDown?: React.MouseEventHandler;
    "data-selectable"?: boolean;
    "data-children"?: boolean;
  }
>(function TreeItemContent(props, ref) {
  const {
    classes,
    className,
    displayIcon,
    expansionIcon,
    icon: iconProp,
    label,
    nodeId,
    onClick,
    children,
    onMouseDown,

    ...other
  } = props;

  const hasChildren = other["data-children"];
  const selectable = other["data-selectable"] !== false;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId);

  const icon = iconProp || expansionIcon || displayIcon;

  const handleMouseDown = useEvent((event: React.MouseEvent) => {
    preventSelection(event);

    if (onMouseDown) {
      onMouseDown(event);
    }
  });

  const ownClasses = useCustomTreeItemStyles({
    selectable,
  });

  const handleClickLabel = useEvent((event: React.MouseEvent) => {
    if (!event.defaultPrevented) {
      handleExpansion(event);
    }
  });

  const handleSelect = useEvent((event: React.MouseEvent) => {
    event.preventDefault();
    if (selectable === false) {
      return;
    }
    preventSelection(event);
    handleSelection(event);

    if (onClick) {
      onClick(event);
    }
  });

  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions -- Key event is handled by the TreeView */
    <div
      className={clsx(className, classes.root, ownClasses.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      onClick={selectable && !hasChildren ? handleSelect : handleClickLabel}
      ref={ref as React.ForwardedRef<HTMLDivElement>}
      {...other}
    >
      <div className={clsx(classes.iconContainer)}>{icon}</div>
      <div className={classes.label}>
        {label}
        {selectable && hasChildren ? (
          <div className={ownClasses.action} onClick={handleSelect}>
            <Typography variant="caption">
              <Trans id="controls.tree.select-value">Select</Trans>
            </Typography>
          </div>
        ) : null}
      </div>
      {selected ? (
        <div className={ownClasses.checkIcon}>
          <Icon name="checkmark" />
        </div>
      ) : null}
    </div>
  );
});

const TreeItem = (props: TreeItemProps) => {
  return <MUITreeItem {...props} ContentComponent={TreeItemContent} />;
};

export type TreeHierarchyValue = Omit<
  HierarchyValue,
  "depth" | "dimensionId" | "children"
> & {
  selectable?: boolean;
  children?: TreeHierarchyValue[];
};

export type Tree = TreeHierarchyValue[];

type NodeId = string;

export type SelectTreeProps = {
  options: Tree;
  value: NodeId | undefined;
  topControls?: React.ReactNode;
  sideControls?: React.ReactNode;
  onChange: (e: { target: { value: NodeId } }) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  open?: boolean;
  id?: string;
};

const getFilteredOptions = (options: Tree, value: string) => {
  const rx = new RegExp(`^${value}|\\s${value}`, "i");
  return value === ""
    ? options
    : (pruneTree(
        options as HierarchyValue[],
        (d) => !!d.label.match(rx)
      ) as Tree);
};

function SelectTree({
  label,
  options,
  value,
  onChange,
  disabled,
  topControls,
  sideControls,
  onOpen,
  onClose,
  open,
  id,
}: SelectTreeProps) {
  const [openState, setOpenState] = useState(false);
  const [minMenuWidth, setMinMenuWidth] = useState<number>();
  const [inputValue, setInputValue] = useState("");
  const classes = useStyles({ disabled, open });
  const [filteredOptions, setFilteredOptions] = useState<Tree>([]);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  const parentsRef = useRef({} as Record<NodeId, NodeId>);
  const menuRef = useRef<PopoverActions>(null);
  const inputRef = useRef<HTMLDivElement>();

  const defaultExpanded = useMemo(() => {
    if (!value && options.length > 0) {
      return options[0].value ? [options[0].value] : [];
    }

    const res = value ? [value] : [];
    let cur = value;
    const parents = parentsRef.current;

    while (cur && parents[cur]) {
      res.push(parents[cur]);
      cur = parents[cur];
    }

    return res;
  }, [value, options]);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const labelsByValue = useMemo(() => {
    parentsRef.current = {} as Record<NodeId, NodeId>;
    const res: Record<string, string> = {};
    const registerNode = ({ value, label, children }: Tree[number]) => {
      res[value] = label;
      if (children && children.length > 0) {
        for (let child of children) {
          registerNode(child);
          parentsRef.current[child.value as unknown as NodeId] = value;
        }
      }
    };
    for (let root of options) {
      registerNode(root);
    }
    return res;
  }, [options]);

  const handleOpen = useEventCallback(() => {
    setOpenState(true);
    setMinMenuWidth(inputRef.current?.clientLeft);
    onOpen?.();
  });

  const handleClose = useEventCallback(() => {
    setOpenState(false);
    setInputValue("");
    setFilteredOptions(getFilteredOptions(options, ""));
    setExpanded(defaultExpanded);
    onClose?.();
  });

  const handleInputChange: TextFieldProps["onChange"] = useEvent((ev) => {
    const value = ev.currentTarget.value;
    setInputValue(value);
    const filteredOptions = getFilteredOptions(options, value);
    setFilteredOptions(filteredOptions);
    setExpanded((curExpanded) => {
      const newExpanded = Array.from(
        new Set([
          ...curExpanded,
          ...flattenTree(filteredOptions as HierarchyValue[]).map(
            (v) => v.value
          ),
        ])
      );
      return newExpanded;
    });
  });

  const handleClickResetInput = useEvent(() => {
    const newValue = "";
    setInputValue(newValue);
    setFilteredOptions(getFilteredOptions(options, newValue));
    setExpanded(defaultExpanded);
  });

  const handleNodeToggle: TreeViewProps["onNodeToggle"] = useEvent(
    (_ev, nodeIds) => {
      setExpanded(nodeIds);
    }
  );

  const handleNodeSelect = useEventCallback((_ev, value: NodeId) => {
    onChange({ target: { value } });
    handleClose();
  });

  const treeItemClasses = useTreeItemStyles();
  const treeItemTransitionProps = useMemo(
    () => ({
      onEntered: () => {
        menuRef.current?.updatePosition();
      },
      onExited: () => {
        menuRef.current?.updatePosition();
      },
    }),
    []
  );
  const renderTreeContent = useCallback(
    (nodesData: Tree) => {
      return (
        <>
          {nodesData.map(({ value, label, children, selectable }) => {
            return (
              <TreeItem
                key={value}
                nodeId={value}
                defaultExpanded={defaultExpanded}
                label={label}
                expandIcon={
                  children && children.length > 0 ? <SvgIcChevronRight /> : null
                }
                classes={treeItemClasses}
                TransitionComponent={Collapse}
                TransitionProps={treeItemTransitionProps}
                ContentProps={{
                  // @ts-expect-error - TS says we cannot put a data attribute
                  // on the HTML element, but we know we can.
                  "data-selectable": selectable,
                  "data-children": children && children.length > 0,
                }}
              >
                {children ? renderTreeContent(children) : null}
              </TreeItem>
            );
          })}
        </>
      );
    },
    [defaultExpanded, treeItemClasses, treeItemTransitionProps]
  );

  const paperProps = useMemo(
    () => ({
      style: {
        minWidth: minMenuWidth ?? 0,
      },
    }),
    [minMenuWidth]
  );

  const menuTransitionProps = useMemo(
    () => ({
      /**
       * Adds transition for top, as we need to reposition the paper when a node is toggled.
       * This needs to be done like this since the Grow transition component imperatively
       * changes the node.style.transition on entering.
       */
      onEnter: (node: HTMLElement, isAppearing: boolean) => {
        if (isAppearing) {
          node.style.transition = `${node.style.transition}, top 158ms cubic-bezier(0.4, 0, 0.2, 1)`;
        }
      },
    }),
    []
  );

  const treeRef = useRef();
  const handleKeyDown: React.HTMLAttributes<HTMLInputElement>["onKeyDown"] =
    useEvent((ev) => {
      if (ev.key === "Enter" || ev.key == " ") {
        handleOpen();
        ev.preventDefault();
      }
    });

  useEffect(() => {
    const inputNode = inputRef.current;
    if (inputNode) {
      setMinMenuWidth(inputNode.clientWidth);
    }
  }, [open]);

  return (
    <div>
      {label && (
        <Label htmlFor={id!} smaller>
          {label} {topControls}
        </Label>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: sideControls ? "calc(100% - 2rem) 2rem" : "100%",
          alignItems: "center",
          columnGap: 2,
        }}
      >
        <OutlinedInput
          id={id}
          name={id}
          readOnly
          value={value ? labelsByValue[value] : undefined}
          disabled={disabled}
          ref={inputRef}
          size="small"
          className={classes.input}
          onClick={disabled ? undefined : handleOpen}
          onKeyDown={handleKeyDown}
          endAdornment={<Icon className={classes.icon} name="chevronDown" />}
        />
        {sideControls}
      </Box>
      <Popover
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        anchorEl={inputRef.current}
        open={open !== undefined ? open : !!openState}
        onClose={handleClose}
        action={menuRef}
        PaperProps={paperProps}
        TransitionProps={menuTransitionProps}
      >
        <TextField
          size="small"
          value={inputValue}
          sx={{ p: 1, width: "100%" }}
          InputProps={{
            autoFocus: true,
            startAdornment: <Icon name="search" size={16} color="#555" />,
            endAdornment: (
              <IconButton size="small" onClick={handleClickResetInput}>
                <Icon name="close" size={16} />
              </IconButton>
            ),
            sx: { "& input": { fontSize: "12px" }, pl: 1, pr: 1 },
          }}
          onChange={handleInputChange}
        />
        {filteredOptions.length === 0 ? (
          <Typography variant="body2" sx={{ px: 2, py: 4 }}>
            <Trans id="No results" />
          </Typography>
        ) : (
          <TreeView
            ref={treeRef}
            defaultSelected={value}
            expanded={expanded}
            onNodeToggle={handleNodeToggle}
            onNodeSelect={handleNodeSelect}
            defaultCollapseIcon={<SvgIcChevronDown />}
            defaultExpandIcon={<SvgIcChevronRight />}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              pb: 2,
              "user-select": "none",
            }}
          >
            {renderTreeContent(filteredOptions)}
          </TreeView>
        )}
      </Popover>
    </div>
  );
}

export default SelectTree;
