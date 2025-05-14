import { TooltipProps, Typography } from "@mui/material";

import { getLabelWithUnit } from "@/charts/shared/chart-helpers";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { UnitConversionFieldExtension } from "@/config-types";
import { Component } from "@/domain/data";
import { useLocale } from "@/src";

export const ComponentLabel = ({
  component,
  tooltipProps,
  linkToMetadataPanel,
  unitConversion,
}: {
  component: Component;
  tooltipProps?: Omit<TooltipProps, "title" | "children">;
  linkToMetadataPanel: boolean;
  unitConversion?: UnitConversionFieldExtension["unitConversion"];
}) => {
  const locale = useLocale();

  return linkToMetadataPanel ? (
    <OpenMetadataPanelWrapper component={component}>
      <ComponentLabelInner
        component={component}
        unitOverride={unitConversion?.labels[locale]}
      />
    </OpenMetadataPanelWrapper>
  ) : component.description ? (
    <MaybeTooltip title={component.description} tooltipProps={tooltipProps}>
      <ComponentLabelInner
        component={component}
        unitOverride={unitConversion?.labels[locale]}
      />
    </MaybeTooltip>
  ) : (
    <ComponentLabelInner
      component={component}
      unitOverride={unitConversion?.labels[locale]}
    />
  );
};

const ComponentLabelInner = ({
  component,
  unitOverride,
}: {
  component: Component;
  unitOverride?: string;
}) => {
  const label = getLabelWithUnit(component, { unitOverride });

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
