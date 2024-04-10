import { t } from "@lingui/macro";
import { Box } from "@mui/material";

import { Icon } from "@/icons";

export const MoveDragButton = () => {
  return (
    <Box
      display="flex"
      component="span"
      sx={{ cursor: "move" }}
      title={t({
        id: "Drag filters to reorganize",
      })}
    >
      <Icon className="buttons" name="dragndrop" />
    </Box>
  );
};
