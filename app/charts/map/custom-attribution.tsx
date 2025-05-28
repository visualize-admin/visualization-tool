import { useTheme } from "@mui/material";
import maplibregl from "maplibre-gl";
import { useEffect } from "react";
import { useMap } from "react-map-gl";

/**
 * Could not use the CustomAttribute from maplibre gl, it was not updating properly
 */
export const CustomAttribution = ({ attribution }: { attribution: string }) => {
  const mapRef = useMap();
  const theme = useTheme();

  useEffect(() => {
    const map = mapRef.current as maplibregl.Map | undefined;

    if (!map) {
      return;
    }

    const control = new maplibregl.AttributionControl({
      // className was not working (?), so style is used. To revisit later if needed.
      customAttribution: attribution
        ? `<span style="color: ${theme.palette.error.main}">${attribution}</span>`
        : undefined,
    });

    // As of now, we cannot "update" the control, we need to add it and remove it
    map.addControl(control, "bottom-right");

    return () => {
      try {
        map.removeControl(control);
      } catch {
        // Ignore the error, it is probably because the map was destroyed
        // before the control was removed
      }
    };
  }, [attribution, mapRef, theme]);

  return null;
};
