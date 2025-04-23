import { t } from "@lingui/macro";
import { TreeItem, TreeView } from "@mui/lab";
import {
  Box,
  Checkbox,
  Collapse,
  IconButton,
  Input,
  Popover,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import React from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { CustomLayer } from "@/charts/map/types";
import { useWMTSorWMSLayers } from "@/charts/map/wms-endpoint-utils";
import { ParsedWMSLayer } from "@/charts/map/wms-utils";
import ProviderAutocomplete from "@/charts/map/wmts-providers-autocomplete";
import { ParsedWMTSLayer } from "@/charts/map/wmts-utils";
import { HintRed, Spinner } from "@/components/hint";
import { Tree, useSelectTree } from "@/components/select-tree";
import { Icon } from "@/icons";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import SvgIcClose from "@/icons/components/IcClose";
import SvgIcInfoCircle from "@/icons/components/IcInfoCircle";
import { mapTree, visitHierarchy } from "@/rdf/tree-utils";

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

const useStyles = makeStyles<Theme>((theme) => ({
  treeRow: {
    display: "flex",
    gap: "0.5rem",
    fontSize: theme.typography.body2.fontSize,
    width: "100%",
    alignItems: "center",
  },
  label: {
    flexGrow: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}));

const LegendButton = ({
  layer,
}: {
  layer: ParsedWMTSLayer | ParsedWMSLayer;
}) => {
  const [showLegend, setShowLegend] = useState<
    | {
        value: string;
        element: HTMLButtonElement;
      }
    | undefined
  >();
  return (
    <>
      <IconButton
        data-value={layer.path}
        size="small"
        onClick={(ev) =>
          setShowLegend({
            value: layer.path,
            element: ev.currentTarget,
          })
        }
      >
        <SvgIcInfoCircle />
      </IconButton>
      <Popover
        elevation={6}
        anchorEl={showLegend?.element}
        open={!!showLegend}
        onClose={() => setShowLegend(undefined)}
      >
        <Box sx={{ p: 2, position: "relative", width: 300 }}>
          <Typography variant="h5" gutterBottom>
            {/* TODO i18n */}
            Legend
          </Typography>
          <IconButton
            sx={{ position: "absolute", top: "0.25rem", right: "0.25rem" }}
            size="small"
            onClick={() => setShowLegend(undefined)}
          >
            <SvgIcClose />
          </IconButton>
          {showLegend && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={layer?.legendUrl} style={{ maxWidth: "100%" }} alt="" />
          )}
        </Box>
      </Popover>
    </>
  );
};

const TreeRow = ({
  layer,
  className,
  labelClassName,
  label,
  value,
  initialChecked,
  onCheck,
}: {
  layer: CustomLayer;
  className?: string;
  labelClassName?: string;
  label: string;
  value: string;
  initialChecked?: boolean;
  onCheck: (layer: CustomLayer, checked: boolean) => void;
}) => {
  const [checked, setChecked] = useState(initialChecked ?? false);
  const handleChangeCheckbox = useCallback(() => {
    return setChecked((c) => {
      const newValue = !c;
      onCheck(layer, newValue);
      return newValue;
    });
  }, [layer, onCheck]);

  return (
    <div className={className} onClick={handleChangeCheckbox}>
      {layer.id ? (
        <Checkbox
          inputProps={{
            // @ts-ignore
            "data-value": value,
          }}
          checked={checked}
        />
      ) : null}
      <span className={labelClassName}>{label}</span>
      {layer && layer.legendUrl ? <LegendButton layer={layer} /> : null}
    </div>
  );
};

const WMTSSelector = ({
  onLayerCheck,
  selected,
}: {
  onLayerCheck: (layer: CustomLayer, checked: boolean) => void;
  selected: string[];
}) => {
  const treeItemClasses = useTreeItemStyles();

  const classes = useStyles();
  const [provider, setProvider] = useState<string | null>(null);
  const endpoints = useMemo(() => (provider ? [provider] : []), [provider]);

  const { data: groupedLayers, error, status } = useWMTSorWMSLayers(endpoints);
  const { wms: wmsLayers, wmts: wmtsLayers } = useMemo(() => {
    return (
      groupedLayers ?? {
        wms: [],
        wmts: [],
      }
    );
  }, [groupedLayers]);

  const allLayers = useMemo(
    // TODO FInd out why there are duplicate ids
    () => uniqBy([...wmsLayers, ...wmtsLayers], (x) => x.id),
    [wmsLayers, wmtsLayers]
  );

  const layersByPath = useMemo(() => {
    const res: Record<string, CustomLayer> = {};
    visitHierarchy(allLayers, (x) => {
      if (res[x.path]) {
        return;
      }
      res[x.path] = x;
    });
    return res;
  }, [allLayers]);

  const selectedSet = useMemo(() => {
    return new Set(selected);
  }, [selected]);

  const options = useMemo(() => {
    return mapTree(allLayers, ({ children, ...x }) => ({
      ...x,
      hasValue: true,
      value: x.path,
      label: x.title,
      id: x.path,
      nodeId: x.path,
      itemId: x.path,
    }));
  }, [allLayers]);

  const {
    inputValue,
    filteredOptions: unsortedFilteredOptions,
    expanded,
    handleInputChange,
    handleNodeToggle,
    handleClickResetInput,
    defaultExpanded,
  } = useSelectTree({
    value: "",
    options,
  });

  const filteredOptions = useMemo(() => {
    return mapTree(
      sortBy(unsortedFilteredOptions, (x) => x.label),
      (x) => ({
        ...x,
        children: sortBy(x.children, (y) => y.label),
      })
    );
  }, [unsortedFilteredOptions]);

  const renderTreeContent = useCallback(
    (nodesData: Tree) => {
      return (
        <>
          {nodesData.map(({ value, label, children, selectable }) => {
            return (
              <TreeItem
                key={value}
                nodeId={value}
                size="small"
                classes={treeItemClasses}
                defaultExpanded={defaultExpanded}
                label={
                  <TreeRow
                    className={classes.treeRow}
                    labelClassName={classes.label}
                    layer={layersByPath[value]}
                    label={label}
                    value={value}
                    onCheck={onLayerCheck}
                    initialChecked={selectedSet.has(layersByPath[value].id)}
                  />
                }
                expandIcon={
                  children && children.length > 0 ? <SvgIcChevronRight /> : null
                }
                TransitionComponent={Collapse}
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
    [
      treeItemClasses,
      defaultExpanded,
      classes.treeRow,
      classes.label,
      layersByPath,
      onLayerCheck,
      selectedSet,
    ]
  );

  const treeRef = useRef();
  const handleNodeSelect = () => {};

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
      display="flex"
      flexDirection="column"
      width="100%"
    >
      {error ? <HintRed>{error.message}</HintRed> : null}
      <ProviderAutocomplete
        value={provider}
        onChange={(newValue) => setProvider(newValue)}
      />

      {provider && (
        <Input
          size="sm"
          value={inputValue}
          autoFocus
          startAdornment={<Icon name="search" size={18} />}
          // TODO i18n
          placeholder={t({
            id: "wmts.search-placeholder",
            message: "Search custom layers",
          })}
          endAdornment={
            inputValue.length > 0 ? (
              <IconButton size="small" onClick={handleClickResetInput}>
                <Icon name="close" size={16} />
              </IconButton>
            ) : null
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
      )}

      {status === "fetching" ? (
        <Box textAlign="center" p={2}>
          <Spinner size={24} />
        </Box>
      ) : null}

      <TreeView
        sx={{ flexGrow: 1, overflow: "auto" }}
        ref={treeRef}
        defaultSelected={undefined}
        expanded={expanded}
        onNodeToggle={handleNodeToggle}
        onNodeSelect={handleNodeSelect}
      >
        {renderTreeContent(filteredOptions)}
      </TreeView>
    </Box>
  );
};

export default WMTSSelector;
