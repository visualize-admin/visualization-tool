import { t, Trans } from "@lingui/macro";
import { TreeItem, TreeView } from "@mui/lab";
import {
  Box,
  Checkbox,
  Collapse,
  IconButton,
  Input,
  Popover,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import createStore from "zustand";

import { RemoteLayer } from "@/charts/map/types";
import { RemoteWMSLayer } from "@/charts/map/wms-utils";
import {
  isRemoteLayerCRSSupported,
  useWMTSorWMSLayers,
} from "@/charts/map/wms-wmts-endpoint-utils";
import ProviderAutocomplete from "@/charts/map/wms-wmts-providers-autocomplete";
import { RemoteWMTSLayer } from "@/charts/map/wmts-utils";
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

    "&:empty": {
      display: "none",
    },
  },
  label: {
    "&&": {
      padding: "0.25rem",
    },
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
    lineHeight: "1.5rem",
  },
  warnIcon: {
    color: theme.palette.warning.main,
  },
}));

const LegendButton = ({
  layer,
}: {
  layer: RemoteWMTSLayer | RemoteWMSLayer;
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
        onClick={(ev) => {
          return setShowLegend({
            value: layer.path,
            element: ev.currentTarget,
          });
        }}
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
            <Trans id="wmts.legend-title">Legend</Trans>
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
  classes,
  label,
  value,
  initialChecked,
  onCheck,
}: {
  layer: RemoteLayer;
  className?: string;
  classes: ReturnType<typeof useStyles>;
  label: string;
  value: string;
  initialChecked?: boolean;
  onCheck: (layer: RemoteLayer, checked: boolean) => void;
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
    <div className={className}>
      {layer.id ? (
        <Checkbox
          inputProps={{
            // @ts-ignore
            "data-value": value,
          }}
          onClick={handleChangeCheckbox}
          checked={checked}
        />
      ) : null}
      <div className={classes.label} onClick={handleChangeCheckbox}>
        {label}
      </div>
      {layer && layer.legendUrl ? <LegendButton layer={layer} /> : null}
      {isRemoteLayerCRSSupported(layer) ? null : (
        <Tooltip
          title={t({
            id: "wmts.layer-not-supported-crs",
            message: "Layer not supported, no supported CRS",
          })}
        >
          <span>
            <Icon name="warningCircleFilled" className={classes.warnIcon} />
          </span>
        </Tooltip>
      )}
    </div>
  );
};

// Zustand store for persistence across open/close
const useInputValueStore = createStore<{
  inputValue: string;
  setInputValue: (inputValue: string) => void;
  provider: string | null;
  setProvider: (provider: string | null) => void;
}>((set) => ({
  inputValue: "",
  setInputValue: (inputValue: string) => {
    set({ inputValue });
  },
  provider: null,
  setProvider: (provider: string | null) => {
    set({ provider });
  },
}));

const WMTSSelector = ({
  onLayerCheck,
  selected,
}: {
  onLayerCheck: (layer: RemoteLayer, checked: boolean) => void;
  selected: string[];
}) => {
  const treeItemClasses = useTreeItemStyles();

  const classes = useStyles();

  const { provider, setProvider, inputValue, setInputValue } =
    useInputValueStore();

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
    () => uniqBy([...wmsLayers, ...wmtsLayers], (x) => x.path),
    [wmsLayers, wmtsLayers]
  );

  const layersByPath = useMemo(() => {
    const res: Record<string, RemoteLayer> = {};
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
    filteredOptions: unsortedFilteredOptions,
    expanded,
    handleInputChange,
    handleNodeToggle,
    handleClickResetInput,
    defaultExpanded,
  } = useSelectTree({
    value: "",
    options,
    inputValue,
    onChangeInputValue: setInputValue,
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
                    classes={classes}
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
      classes,
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
