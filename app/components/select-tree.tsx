import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MUITreeItem, {
  TreeItemContentClassKey,
  TreeItemProps,
  useTreeItem,
} from "@mui/lab/TreeItem";
import TreeView from "@mui/lab/TreeView";
import {
  Theme,
  Menu,
  PopoverActions,
  useEventCallback,
  OutlinedInput,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import useId from "@mui/utils/useId";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import * as React from "react";

import { Label } from "@/components/form";
import { Icon } from "@/icons";
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
    fontSize: theme.typography.body2.fontSize,

    [theme.breakpoints.up("xs")]: {
      "&": {
        fontSize: theme.typography.body2.fontSize,
      },
    },
  },
}));

const TreeItemContent = React.forwardRef<
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
    onMouseDown,

    ...other
  } = props;

  const selectable = other["data-selectable"];

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

  const handleClickLabel = useEvent((event: React.MouseEvent) => {
    if (selectable === false) {
      handleExpansion(event);
      return;
    }
    preventSelection(event);
    handleSelection(event);

    if (onClick) {
      onClick(event);
    }
  });

  const handleClickIcon = useEvent((event: React.MouseEvent) => {
    handleExpansion(event);
  });

  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions -- Key event is handled by the TreeView */
    <div
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref as React.ForwardedRef<HTMLDivElement>}
      {...other}
    >
      <div onClick={handleClickIcon} className={clsx(classes.iconContainer)}>
        {icon}
      </div>
      <div onClick={handleClickLabel} className={classes.label}>
        {label}
      </div>
    </div>
  );
});

const TreeItem = (props: TreeItemProps) => {
  return <MUITreeItem {...props} ContentComponent={TreeItemContent} />;
};

type Tree = {
  value: string;
  label: string;
  children?: Tree;
  selectable?: boolean;
}[];

type NodeId = string;

export type SelectTreeProps = {
  options: Tree;
  value: NodeId | undefined;
  controls?: React.ReactNode;
  onChange: (ev: { target: { value: NodeId } }) => void;
  disabled?: boolean;
  tooltipText?: string;
  label?: string;
};

function SelectTree({
  label,
  options,
  value,
  onChange,
  tooltipText,
  disabled,
  controls,
}: SelectTreeProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const [minMenuWidth, setMinMenuWidth] = useState<number>();

  const handleClick = useEventCallback((ev: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(ev.currentTarget);
    setMinMenuWidth(ev.currentTarget.clientWidth);
  });
  const handleClose = useEventCallback(() => {
    setAnchorEl(undefined);
  });
  const open = !!anchorEl;
  const classes = useStyles({ disabled, open });

  const parentsRef = React.useRef({} as Record<NodeId, NodeId>);
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

  const defaultExpanded = useMemo(() => {
    const res = [];
    let cur = value;
    const parents = parentsRef.current;
    while (cur && parents[cur]) {
      res.push(parents[cur]);
      cur = parents[cur];
    }
    return res;
  }, [value]);

  const handleNodeSelect = useEventCallback((_ev, value: NodeId) => {
    onChange({ target: { value: value } });
    handleClose();
  });

  const treeItemClasses = useTreeItemStyles();
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
                  children && children.length > 0 ? <ChevronRightIcon /> : null
                }
                classes={treeItemClasses}
                ContentProps={{
                  // @ts-expect-error - TS says we cannot put a data attribute
                  // on the HTML element, but we know we can.
                  "data-selectable": selectable,
                }}
              >
                {children ? renderTreeContent(children) : null}
              </TreeItem>
            );
          })}
        </>
      );
    },
    [defaultExpanded, treeItemClasses]
  );

  const menuRef = React.useRef<PopoverActions>(null);
  const handleNodeToggle = () => {
    setTimeout(() => {
      menuRef.current?.updatePosition();
    }, 500);
    setTimeout(() => {
      menuRef.current?.updatePosition();
    }, 1000);
    setTimeout(() => {
      menuRef.current?.updatePosition();
    }, 2000);
  };

  const paperProps = useMemo(() => {
    return {
      style: {
        minWidth: minMenuWidth === undefined ? 0 : minMenuWidth,
      },
    };
  }, [minMenuWidth]);

  const transitionProps = useMemo(() => {
    return {
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
    };
  }, []);

  const id = useId();

  return (
    <div>
      {label && (
        <Label htmlFor={id!} smaller tooltipText={tooltipText} sx={{ mb: 1 }}>
          {label} {controls}
        </Label>
      )}
      <OutlinedInput
        id={id}
        readOnly
        value={value ? labelsByValue[value] : undefined}
        disabled={disabled}
        size="small"
        className={classes.input}
        onClick={disabled ? undefined : handleClick}
        endAdornment={<Icon className={classes.icon} name="caretDown" />}
      />
      <Menu
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        action={menuRef}
        PaperProps={paperProps}
        TransitionProps={transitionProps}
      >
        <TreeView
          defaultSelected={value}
          defaultExpanded={defaultExpanded}
          onNodeSelect={handleNodeSelect}
          onNodeToggle={handleNodeToggle}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          // onNodeSelect={handleNodeSelect}
          sx={{ flexGrow: 1, overflowY: "auto", pb: 2, "user-select": "none" }}
        >
          {renderTreeContent(options)}
        </TreeView>
      </Menu>
    </div>
  );
}

export default SelectTree;
