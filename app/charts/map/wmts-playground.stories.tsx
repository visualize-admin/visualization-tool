import { supported } from "@mapbox/mapbox-gl-supported";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import maplibreglRaw from "maplibre-gl";
import { useMemo } from "react";
import Map from "react-map-gl";

import { CustomAttribution } from "@/charts/map/custom-attribution";
import { useMapStyle } from "@/charts/map/get-base-layer-style";
import { DeckGLOverlay } from "@/charts/map/helpers";
import { RemoteLayer } from "@/charts/map/types";
import { getWMSTile } from "@/charts/map/wms-utils";
import { WMTSSelector } from "@/charts/map/wms-wmts-selector";
import { getWMTSTile } from "@/charts/map/wmts-utils";
import { Icon } from "@/icons";
import { LocaleProvider } from "@/locales";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEvent } from "@/utils/use-event";
import { useLocalState } from "@/utils/use-local-state";

import "maplibre-gl/dist/maplibre-gl.css";

const maplibregl = { ...maplibreglRaw, supported };

const WMTSPlayground = () => {
  const [layers, setLayers] = useLocalState(
    "storybook-wmts-playground",
    [] as RemoteLayer[]
  );
  const onLayerCheck = useEvent((layer: RemoteLayer, checked: boolean) => {
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
        ? getWMSTile({ wmsLayer: x, customLayer: x })
        : getWMTSTile({ wmtsLayer: x, customLayer: x });
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
          height: "80vh",
        }}
      >
        <Box
          sx={{
            p: "0.5rem",
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box flexGrow={1} overflow="auto">
            <WMTSSelector onLayerCheck={onLayerCheck} selected={[]} />
          </Box>
          <Accordion defaultExpanded sx={{ flexShrink: 1 }}>
            <AccordionSummary
              sx={{ typography: "body2" }}
              expandIcon={<Icon name="chevronDown" />}
            >
              Added Layers
            </AccordionSummary>
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

export { WMTSPlayground };

const meta = {
  title: "Charts/Map/WMTS",
  component: WMTSPlayground,
};

export default meta;
