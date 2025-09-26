import { TooltipProps, Typography } from "@mui/material";

import { getLabelWithUnit } from "@/charts/shared/chart-helpers";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { Component } from "@/domain/data";

export const ComponentLabel = ({
  component,
  tooltipProps,
  linkToMetadataPanel,
}: {
  component: Component;
  tooltipProps?: Omit<TooltipProps, "title" | "children">;
  linkToMetadataPanel: boolean;
}) => {
  return linkToMetadataPanel ? (
    <OpenMetadataPanelWrapper component={component}>
      <ComponentLabelInner component={component} />
    </OpenMetadataPanelWrapper>
  ) : component.description ? (
    <MaybeTooltip title={component.description} tooltipProps={tooltipProps}>
      <div>
        <ComponentLabelInner component={component} />
      </div>
    </MaybeTooltip>
  ) : (
    <ComponentLabelInner component={component} />
  );
};

const ComponentLabelInner = ({ component }: { component: Component }) => {
  const label = getLabelWithUnit(component);

  return (
    <Typography
      variant="h6"
      component="span"
      color="monochrome.500"
      textTransform="uppercase"
    >
      {label}
    </Typography>
  );
};
