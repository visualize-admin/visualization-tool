import React, { useState } from "react";
import { Box, Grid } from "@mui/material";
import { Icon } from "../../icons";

const ATTRIBUTION = "© Data: MapTiler, OpenStreetMap contributors, Swisstopo";
const ICON_SIZE = 14;

interface Props {
  compact: boolean;
}

export const MapAttribution = (props: Props) => {
  const { compact } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  return !compact ? (
    <MapAttributionBox>{ATTRIBUTION}</MapAttributionBox>
  ) : (
    <MapAttributionBox
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <Grid
        sx={{
          gridTemplateColumns: `1fr ${ICON_SIZE}px`,
          gridGap: 1,
          alignItems: "flex-end",
        }}
      >
        {<span>{isExpanded ? ATTRIBUTION : ""}</span>}
        <Icon name="info" size={ICON_SIZE} />
      </Grid>
    </MapAttributionBox>
  );
};

const MapAttributionBox = (
  props: React.ComponentPropsWithoutRef<typeof Box>
) => {
  const { children, ...rest } = props;

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        right: 0,
        padding: 1,
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        fontSize: "11px",
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};
