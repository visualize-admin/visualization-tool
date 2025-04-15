import { HTMLProps, useCallback, useMemo, useRef, useState } from "react";

import { Tree, useSelectTree } from "@/components/select-tree";
import { mapTree, visitHierarchy } from "@/rdf/tree-utils";
import Map from "react-map-gl";

import {
  DEFAULT_WMS_URL,
  getWMSTile,
  ParsedWMSLayer,
} from "@/charts/map/wms-utils";
import { TreeItem, TreeView } from "@mui/lab";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
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
import { Icon } from "@/icons";
import ProviderAutocomplete from "@/charts/map/wmts-providers-autocomplete";
import { DEFAULT_WMTS_URL, ParsedWMTSLayer } from "@/charts/map/wmts-utils";
import { useWMTSorWMSLayers } from "@/charts/map/wms-endpoint-utils";
import { HintRed, Spinner } from "@/components/hint";
import { makeStyles } from "@mui/styles";
import SvgIcZoomIn from "@/icons/components/IcZoomIn";
import SvgIcInfoCircle from "@/icons/components/IcInfoCircle";
import { keyBy, uniqBy } from "lodash";
import SvgIcClose from "@/icons/components/IcClose";
import { LocaleProvider } from "@/locales";

import React from "react";
import DeckGL from "@deck.gl/react";
import { MapViewState } from "@deck.gl/core";
import { _WMSLayer as DeckGLWMSLayer } from "@deck.gl/geo-layers";
import { useMapStyle } from "@/charts/map/get-base-layer-style";
import maplibreglRaw from "maplibre-gl";
import { supported } from "@mapbox/mapbox-gl-supported";
import { DeckGLOverlay } from "@/charts/map/helpers";
import "maplibre-gl/dist/maplibre-gl.css";

const maplibregl = { ...maplibreglRaw, supported };

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
        data-value={layer.id}
        size="small"
        onClick={(ev) =>
          setShowLegend({
            value: layer.id,
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
            <img src={layer?.legendUrl} style={{ maxWidth: "100%" }} />
          )}
        </Box>
      </Popover>
    </>
  );
};

type CustomLayer = ParsedWMSLayer | ParsedWMTSLayer;

const TreeRow = ({
  layer,
  className,
  labelClassName,
  label,
  value,
  initialChecked,
  onCheck,
}: {
  layer: ParsedWMSLayer | ParsedWMTSLayer;
  className?: string;
  labelClassName?: string;
  label: string;
  value: string;
  initialChecked?: boolean;
  onCheck: (layer: CustomLayer, checked: boolean) => void;
}) => {
  const [checked, setChecked] = useState(initialChecked);
  const handleChangeCheckbox = useCallback(() => {
    return setChecked((c) => {
      const newValue = !c;
      onCheck(layer, newValue);
      return newValue;
    });
  }, []);

  const handleClickZoom: HTMLProps<HTMLButtonElement>["onClick"] = useCallback(
    (ev) => {
      const value = ev.currentTarget.dataset["value"];
      console.log("Clicked zoom for layer", layer);
    },
    []
  );

  return (
    <Box className={className} onClick={handleChangeCheckbox}>
      <Checkbox
        inputProps={{
          // @ts-ignore
          "data-value": value,
        }}
        checked={checked}
      />
      <span className={labelClassName}>{label}</span>
      <IconButton size="small" onClick={handleClickZoom} data-value={value}>
        <SvgIcZoomIn />
      </IconButton>
      {layer && layer.legendUrl ? <LegendButton layer={layer} /> : null}
    </Box>
  );
};

const WMTSSelector = ({
  onLayerCheck,
}: {
  onLayerCheck: (layer: CustomLayer, checked: boolean) => void;
}) => {
  const treeItemClasses = useTreeItemStyles();

  const classes = useStyles();
  const [provider, setProvider] = useState<string | null>(null);
  const endpoints = useMemo(
    () => (provider ? [provider] : [DEFAULT_WMTS_URL, DEFAULT_WMS_URL]),
    [provider]
  );

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

  const layersById = useMemo(() => {
    const res: Record<string, CustomLayer> = {};
    visitHierarchy(allLayers, (x) => {
      if (res[x.id]) {
        return;
      }
      res[x.id] = x;
    });
    return res;
  }, [allLayers]);

  const options = useMemo(() => {
    return mapTree(allLayers, ({ children, ...x }) => ({
      ...x,
      hasValue: true,
      value: x.id,
      label: x.title,
      id: x.id,
      nodeId: x.title,
      itemId: x.title,
    }));
  }, [allLayers]);

  const {
    inputValue,
    filteredOptions,
    expanded,
    handleInputChange,
    handleNodeToggle,
    handleClickResetInput,
    defaultExpanded,
  } = useSelectTree({
    value: "",
    options,
  });

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
                    layer={layersById[value]}
                    label={label}
                    value={value}
                    onCheck={onLayerCheck}
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
    [defaultExpanded]
  );

  const treeRef = useRef();
  const [value, setValue] = useState("");
  const handleNodeSelect = () => {};

  return (
    <Box
      sx={{
        width: 375,
        maxWidth: "100%",
        height: "80vh",
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

      <Input
        size="sm"
        value={inputValue}
        autoFocus
        startAdornment={<Icon name="search" size={18} />}
        // TODO i18n
        placeholder="Search custom layers"
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

      {status === "fetching" ? (
        <Box textAlign="center" p={2}>
          <Spinner size={24} />
        </Box>
      ) : null}

      <TreeView
        sx={{ flexGrow: 1, overflow: "auto" }}
        ref={treeRef}
        defaultSelected={value}
        expanded={expanded}
        // onNodeToggle={handleNodeToggle}
        onNodeSelect={handleNodeSelect}
      >
        {renderTreeContent(filteredOptions)}
      </TreeView>
    </Box>
  );
};

export const WMTSPlayground = () => {
  const [layers, setLayers] = useState(() => [] as CustomLayer[]);
  const onLayerCheck = (layer: CustomLayer, checked: boolean) => {
    setLayers((layers) =>
      checked ? [...layers, layer] : layers.filter((l) => l != layer)
    );
  };

  const mapStyle = useMapStyle({
    locale: "en",
    showBaseLayer: true,
    showLabels: true,
  });

  return (
    <LocaleProvider value="en">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          border: "1px solid",
          borderColor: "cobalt.500",
        }}
      >
        <Box sx={{ p: "0.5rem" }}>
          <WMTSSelector onLayerCheck={onLayerCheck} />
        </Box>
        <Box sx={{ position: "relative" }}>
          <Map
            mapLib={maplibregl}
            mapStyle={mapStyle}
            // Important so we can take a screenshot of the map
            preserveDrawingBuffer
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
            }}
            dragPan
            scrollZoom
            doubleClickZoom
            dragRotate={false}
            touchZoomRotate
          >
            <DeckGLOverlay
              layers={layers.map((x) => {
                return x.type === "wms"
                  ? new DeckGLWMSLayer({
                      id: `wms-layer-${x.id}`,
                      data: x.dataUrl,
                      serviceType: "wms",
                      layers: [x.id],
                    })
                  : null;
              })}
            />
          </Map>
        </Box>
        {/* DeckGL React Map */}
      </Box>
    </LocaleProvider>
  );
};

export default WMTSPlayground;
