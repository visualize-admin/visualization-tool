import { supported } from "@mapbox/mapbox-gl-supported";
import { TreeItem, TreeView } from "@mui/lab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Collapse,
  IconButton,
  Input,
  List,
  ListItem,
  Popover,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import uniqBy from "lodash/uniqBy";
import maplibreglRaw from "maplibre-gl";
import React from "react";
import {
  HTMLProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Map, { useMap } from "react-map-gl";

import { useMapStyle } from "@/charts/map/get-base-layer-style";
import { DeckGLOverlay } from "@/charts/map/helpers";
import { useWMTSorWMSLayers } from "@/charts/map/wms-endpoint-utils";
import {
  DEFAULT_WMS_URL,
  getWMSTile,
  ParsedWMSLayer,
} from "@/charts/map/wms-utils";
import ProviderAutocomplete from "@/charts/map/wmts-providers-autocomplete";
import {
  DEFAULT_WMTS_URL,
  getWMTSTile,
  ParsedWMTSLayer,
} from "@/charts/map/wmts-utils";
import { HintRed, Spinner } from "@/components/hint";
import { Tree, useSelectTree } from "@/components/select-tree";
import { Icon } from "@/icons";
import SvgIcChevronRight from "@/icons/components/IcChevronRight";
import SvgIcClose from "@/icons/components/IcClose";
import SvgIcInfoCircle from "@/icons/components/IcInfoCircle";
import SvgIcZoomIn from "@/icons/components/IcZoomIn";
import { LocaleProvider } from "@/locales";
import { mapTree, visitHierarchy } from "@/rdf/tree-utils";
import "maplibre-gl/dist/maplibre-gl.css";
import useEvent from "@/utils/use-event";
import useLocalState from "@/utils/use-local-state";
import sortBy from "lodash/sortBy";

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
  const [checked, setChecked] = useState(initialChecked ?? false);
  const handleChangeCheckbox = useCallback(() => {
    return setChecked((c) => {
      const newValue = !c;
      onCheck(layer, newValue);
      return newValue;
    });
  }, [layer, onCheck]);

  const handleClickZoom: HTMLProps<HTMLButtonElement>["onClick"] =
    useCallback(() => {
      console.log("Clicked zoom for layer", layer);
    }, [layer]);

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
    [defaultExpanded, classes, layersByPath, onLayerCheck, treeItemClasses]
  );

  const treeRef = useRef();
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

/**
 * Could not use the CustomAttribute from maplibre gl, it was not updating properly
 */
const CustomAttribution = ({ attribution }: { attribution: string }) => {
  const mapRef = useMap();
  const theme = useTheme();
  useEffect(() => {
    const map = mapRef.current as maplibregl.Map | undefined;
    if (!map || !attribution) {
      return;
    }
    const control = new maplibregl.AttributionControl({
      // className was not working (?), so style is used. To revisit later if needed.
      customAttribution: `<span style="color: ${theme.palette.error.main}">${attribution}</span>`,
    });
    // As of now, we cannot "update" the control, we need to add it and remove it
    map.addControl(control, "bottom-right");
    return () => {
      map.removeControl(control);
    };
  }, [attribution, mapRef, theme]);
  return null;
};

const WMTSPlayground = () => {
  const [layers, setLayers] = useLocalState(
    "storybook-wmts-playground",
    [] as CustomLayer[]
  );
  const onLayerCheck = useEvent((layer: CustomLayer, checked: boolean) => {
    setLayers((layers) =>
      checked ? [...layers, layer] : layers.filter((l) => l != layer)
    );
  });

  const mapStyle = useMapStyle({
    locale: "en",
    showBaseLayer: true,
    showLabels: true,
  });

  const deckglLayers = useMemo(() => {
    return layers.map((x) => {
      return x.type === "wms"
        ? getWMSTile({ wmsLayers: [x], customLayer: x })
        : getWMTSTile({ wmtsLayers: [x], customLayer: x });
    });
  }, [layers]);

  const attribution = useMemo(() => {
    return Array.from(new Set(layers.map((x) => x.attribution))).join(", ");
  }, [layers]);

  return (
    <LocaleProvider value="en">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "500px 1fr",
          border: "1px solid",
          borderColor: "cobalt.500",
        }}
      >
        <Box sx={{ p: "0.5rem" }}>
          <WMTSSelector onLayerCheck={onLayerCheck} />
          <Accordion defaultExpanded>
            <AccordionSummary>Added Layers</AccordionSummary>
            <AccordionDetails>
              <List>
                {layers.map((x) => {
                  return (
                    <ListItem
                      key={x.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() =>
                            setLayers((layers) => layers.filter((y) => x !== y))
                          }
                        >
                          <Icon name="trash" />
                        </IconButton>
                      }
                    >
                      <Typography variant="body2">{x.title}</Typography>
                    </ListItem>
                  );
                })}
              </List>
            </AccordionDetails>
          </Accordion>
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
            attributionControl={false}
          >
            <DeckGLOverlay layers={deckglLayers} />
            <CustomAttribution attribution={attribution} />
          </Map>
        </Box>
      </Box>
    </LocaleProvider>
  );
};

export default WMTSPlayground;
