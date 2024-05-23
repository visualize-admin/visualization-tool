import { Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import capitalize from "lodash/capitalize";
import omit from "lodash/omit";

import { generateLayout } from "@/components/react-grid";
import { ChartConfig, LayoutDashboard } from "@/config-types";
import { LayoutAnnotator } from "@/configurator/components/annotators";
import {
  ControlSection,
  ControlSectionContent,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import { IconButton } from "@/configurator/components/icon-button";
import {
  isLayouting,
  useConfiguratorState,
} from "@/configurator/configurator-state";

export const LayoutConfigurator = () => {
  return (
    <>
      <LayoutAnnotator />
      <LayoutLayoutConfigurator />
    </>
  );
};

const LayoutLayoutConfigurator = () => {
  const [state] = useConfiguratorState(isLayouting);
  const { layout } = state;

  switch (layout.type) {
    case "dashboard":
      return (
        <ControlSection
          role="tablist"
          aria-labelledby="controls-design"
          collapse
        >
          <SubsectionTitle
            titleId="controls-design"
            disabled={false}
            gutterBottom={false}
          >
            <Trans id="controls.section.layout-options">Layout Options</Trans>
          </SubsectionTitle>
          <ControlSectionContent px="small" gap="none">
            <Box
              sx={{
                display: "flex",
                gap: "0.75rem",
                m: 2,
              }}
            >
              <LayoutButton type="tall" layout={layout} />
              <LayoutButton type="vertical" layout={layout} />
              <LayoutButton type="tiles" layout={layout} />
            </Box>
          </ControlSectionContent>
        </ControlSection>
      );
    default:
      return null;
  }
};

type LayoutButtonProps = {
  type: LayoutDashboard["layout"];
  layout: LayoutDashboard;
};

const migrateLayout = (
  layout: LayoutDashboard,
  newLayoutType: LayoutDashboard["layout"],
  chartConfigs: ChartConfig[]
): LayoutDashboard => {
  if (newLayoutType === "tiles") {
    const generated = generateLayout({
      count: chartConfigs.length,
      layout: "tiles",
    });
    return {
      ...layout,
      layout: newLayoutType,
      layouts: {
        lg: generated.map((l, i) => ({
          ...l,

          // We must pay attention to correctly change the i value to
          // chart config key, as it is used to identify the layout
          i: chartConfigs[i].key,
        })),
      },
    };
  } else {
    return {
      ...omit(layout, "layouts"),
      layout: newLayoutType,
    };
  }
};

const LayoutButton = (props: LayoutButtonProps) => {
  const { type, layout } = props;
  const [config, dispatch] = useConfiguratorState(isLayouting);

  return (
    <IconButton
      label={`layout${capitalize(type)}`}
      checked={layout.layout === type}
      onClick={() => {
        dispatch({
          type: "LAYOUT_CHANGED",
          value: migrateLayout(layout, type, config.chartConfigs),
        });
      }}
    />
  );
};
