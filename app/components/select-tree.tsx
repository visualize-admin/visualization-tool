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
  Input,
  Popover,
  PopoverActions,
  Select,
  SelectProps,
  TextFieldProps,
  Theme,
  Typography,
  useControlled,
  useEventCallback,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import {
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  type MouseEvent,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Label, selectSizeToTypography } from "@/components/form";
import { HierarchyValue } from "@/domain/data";
import { Icon } from "@/icons";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import { flattenTree, pruneTree } from "@/rdf/tree-utils";
import useEvent from "@/utils/use-event";

const useTreeItemStyles = makeStyles({
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
});

const useCustomTreeItemStyles = makeStyles<Theme, { selectable?: boolean }>(
  (theme) => ({
    action: {
      marginLeft: theme.spacing(2),
      color: theme.palette.text.primary,
      lineHeight: 0,
      transform: "translateX(0)",
      opacity: 0.5,
      transition: "transform 0.3s ease, opacity 0.3s ease",

      "&:hover": {
        opacity: 1,
        color: theme.palette.primary.main,
      },
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
      marginRight: theme.spacing(1),
    },
  })
);

const TreeItemContent = forwardRef<
  unknown,
  {
    classes: Record<TreeItemContentClassKey, string>;
    className?: string;
    displayIcon?: ReactNode;
    expansionIcon?: ReactNode;
    size?: SelectProps["size"];
    icon?: ReactNode;
    label?: ReactNode;
    onClick?: MouseEventHandler;
    nodeId: string;
    onMouseDown?: MouseEventHandler;
    "data-selectable"?: boolean;
    "data-children"?: boolean;
  }
>(function TreeItemContent(props, ref) {
  const {
    classes,
    className,
    displayIcon,
    expansionIcon,
    size = "sm",
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

  const handleMouseDown = useEvent((e: MouseEvent) => {
    preventSelection(e);

    if (onMouseDown) {
      onMouseDown(e);
    }
  });

  const ownClasses = useCustomTreeItemStyles({
    selectable,
  });

  const handleClickLabel = useEvent((e: MouseEvent) => {
    if (!e.defaultPrevented) {
      handleExpansion(e);
    }
  });

  const handleSelect = useEvent((e: MouseEvent) => {
    e.preventDefault();

    if (selectable === false) {
      return;
    }

    preventSelection(e);
    handleSelection(e);

    if (onClick) {
      onClick(e);
    }
  });

  return (
    <div
      className={clsx(className, classes.root, ownClasses.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      onClick={selectable && !hasChildren ? handleSelect : handleClickLabel}
      ref={ref as ForwardedRef<HTMLDivElement>}
      {...other}
    >
      <div className={clsx(classes.iconContainer)}>{icon}</div>
      <div className={classes.label}>
        <Typography variant={selectSizeToTypography[size]} component="span">
          {label}
        </Typography>
        {selectable && hasChildren ? (
          <div className={ownClasses.action} onClick={handleSelect}>
            <Typography variant={selectSizeToTypography[size]} component="span">
              <Trans id="controls.tree.select-value">Select</Trans>
            </Typography>
          </div>
        ) : null}
      </div>
      {selected ? (
        <div className={ownClasses.checkIcon}>
          <Icon name="checkmark" size={20} />
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
  size?: SelectProps["size"];
  options: Tree;
  value: NodeId | undefined;
  sideControls?: ReactNode;
  onChange: (e: { target: { value: NodeId } }) => void;
  disabled?: boolean;
  label?: ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  open?: boolean;
  id?: string;

  // Controlled input value
  inputValue?: string;
  onChangeInputValue?: (value: string) => void;
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

/**
 * Manages business logic for a select tree with search functionality
 *
 * When searching, the tree is automatically expanded
 */
export const useSelectTree = ({
  value,
  options,
  inputValue: controlledInputValue,
  onChangeInputValue,
}: Pick<
  SelectTreeProps,
  "value" | "options" | "inputValue" | "onChangeInputValue"
>) => {
  const [inputValue, setInputValue_] = useControlled({
    name: "SelectTree",
    state: "inputValue",
    controlled: controlledInputValue,
    default: "",
  });

  const setInputValue = useEvent((value: string) => {
    setInputValue_(value);
    onChangeInputValue?.(value);
  });

  const optionsRef = useRef(options);
  const [filteredOptions_, setFilteredOptions] = useState<Tree>([]);

  // Trick to get filteredOptions updated synchronously
  const filteredOptions =
    optionsRef.current !== options ? options : filteredOptions_;

  optionsRef.current = options;

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  const parentsRef = useRef({} as Record<NodeId, NodeId>);

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

  const handleNodeToggle: TreeViewProps["onNodeToggle"] = useEvent(
    (_ev, nodeIds) => {
      setExpanded(nodeIds);
    }
  );

  const handleClickResetInput = useEvent(() => {
    const newValue = "";
    setInputValue(newValue);
    setFilteredOptions(getFilteredOptions(options, newValue));
    setExpanded(defaultExpanded);
  });

  return {
    inputValue,
    setInputValue,
    filteredOptions,
    setFilteredOptions,
    expanded,
    setExpanded,
    handleInputChange,
    parentsRef,
    handleNodeToggle,
    handleClickResetInput,
    defaultExpanded,
  };
};

const SelectTree = ({
  size = "sm",
  label,
  options,
  value,
  onChange,
  disabled,
  sideControls,
  onOpen,
  onClose,
  open,
  id,
}: SelectTreeProps) => {
  const [openState, setOpenState] = useState(false);
  const [minMenuWidth, setMinMenuWidth] = useState<number>();

  const {
    inputValue,
    setInputValue,
    filteredOptions,
    setFilteredOptions,
    parentsRef,
    expanded,
    setExpanded,
    handleInputChange,
    handleNodeToggle,
    handleClickResetInput,
    defaultExpanded,
  } = useSelectTree({
    value,
    options,
  });

  const menuRef = useRef<PopoverActions>(null);
  const inputRef = useRef<HTMLDivElement>();

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
  }, [options, parentsRef]);

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
                size={size}
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
    [defaultExpanded, size, treeItemClasses, treeItemTransitionProps]
  );

  const paperProps = useMemo(
    () => ({
      sx: {
        minWidth: minMenuWidth ?? 0,
        boxShadow: 3,
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
  const handleKeyDown: HTMLAttributes<HTMLInputElement>["onKeyDown"] = useEvent(
    (e) => {
      if (e.key === "Enter" || e.key == " ") {
        handleOpen();
        e.preventDefault();
      }
    }
  );

  useEffect(() => {
    const inputNode = inputRef.current;
    if (inputNode) {
      setMinMenuWidth(inputNode.clientWidth);
    }
  }, [open]);

  return (
    <div>
      {label && (
        <Label
          htmlFor={id!}
          sx={{ display: "flex", alignItems: "center", mb: 1 }}
        >
          {label}
        </Label>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Select
          aria-expanded={open}
          ref={inputRef}
          id={id}
          name={id}
          size="sm"
          disabled={disabled}
          readOnly
          value={value ? labelsByValue[value] : undefined}
          onClick={disabled ? undefined : handleOpen}
          onKeyDown={handleKeyDown}
          renderValue={(value) => {
            return <>{value}</>;
          }}
          sx={{
            "& svg": {
              // Force icon rotation, as the Select is read only to keep the styling,
              // but allow of rendering custom tree menu.
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            },
          }}
        />
        {sideControls}
      </Box>
      <Popover
        anchorEl={inputRef.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={open !== undefined ? open : !!openState}
        onClose={handleClose}
        action={menuRef}
        slotProps={{ paper: paperProps }}
        TransitionProps={menuTransitionProps}
      >
        <Input
          size="sm"
          value={inputValue}
          autoFocus
          startAdornment={<Icon name="search" size={18} />}
          endAdornment={
            <IconButton size="small" onClick={handleClickResetInput}>
              <Icon name="close" size={16} />
            </IconButton>
          }
          onChange={handleInputChange}
          sx={{
            px: 2,
            py: 1,

            "& .MuiInput-input": {
              px: 1,
            },
          }}
        />
        {filteredOptions.length === 0 ? (
          <Typography
            variant={selectSizeToTypography[size]}
            component="p"
            sx={{ py: 2, textAlign: "center" }}
          >
            <Trans id="No results" />
          </Typography>
        ) : (
          <TreeView
            ref={treeRef}
            defaultSelected={value}
            expanded={expanded}
            onNodeToggle={handleNodeToggle}
            onNodeSelect={handleNodeSelect}
          >
            {renderTreeContent(filteredOptions)}
          </TreeView>
        )}
      </Popover>
    </div>
  );
};

export default SelectTree;
