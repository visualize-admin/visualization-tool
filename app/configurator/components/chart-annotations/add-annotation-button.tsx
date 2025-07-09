import { Trans } from "@lingui/macro";
import { Menu, MenuItem } from "@mui/material";
import { MouseEvent, useState } from "react";

import { ConfiguratorAddButton } from "@/components/add-button";
import { Annotation } from "@/config-types";
import { getDefaultHighlightAnnotation } from "@/configurator/components/chart-annotations/utils";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useEvent } from "@/utils/use-event";

export const AddAnnotationButton = () => {
  const [_, dispatch] = useConfiguratorState(isConfiguring);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleOpen = useEvent((e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  });
  const handleClose = useEvent(() => {
    setAnchorEl(null);
  });
  const handleAddAnnotation = useEvent((type: Annotation["type"]) => {
    setAnchorEl(null);

    let annotation: Annotation;

    switch (type) {
      case "highlight":
        annotation = getDefaultHighlightAnnotation();
        break;
      default:
        const _exhaustiveCheck: never = type;
        return _exhaustiveCheck;
    }

    dispatch({
      type: "CHART_ANNOTATION_ADD",
      value: annotation,
    });
    dispatch({
      type: "CHART_ACTIVE_FIELD_CHANGED",
      value: annotation.key,
    });
  });

  return (
    <>
      <ConfiguratorAddButton onClick={handleOpen} sx={{ mx: 4 }}>
        <Trans id="controls.annotations.add">Add</Trans>
      </ConfiguratorAddButton>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
        <MenuItem onClick={() => handleAddAnnotation("highlight")}>
          <Trans id="controls.annotations.add.highlight">Highlight</Trans>
        </MenuItem>
      </Menu>
    </>
  );
};
