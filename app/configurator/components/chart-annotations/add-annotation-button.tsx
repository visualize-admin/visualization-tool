import { Trans } from "@lingui/macro";
import { Menu, MenuItem } from "@mui/material";
import { MouseEvent, useState } from "react";

import { ConfiguratorAddButton } from "@/components/add-button";
import { Annotation } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { getDefaultHighlightAnnotation } from "@/configurator/components/chart-annotations/utils";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useEvent } from "@/utils/use-event";

const MAX_ANNOTATIONS = 3;

export const AddAnnotationButton = () => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const { annotations } = chartConfig;

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
      type: "CHART_ACTIVE_FIELD_CHANGE",
      value: annotation.key,
    });
  });

  return annotations.length < MAX_ANNOTATIONS ? (
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
  ) : null;
};
