import { Trans } from "@lingui/macro";
import {
  Box,
  FormControlLabel,
  Stack,
  Switch,
  SwitchProps,
  Typography,
  useEventCallback,
} from "@mui/material";
import capitalize from "lodash/capitalize";
import keyBy from "lodash/keyBy";
import omit from "lodash/omit";
import uniqBy from "lodash/uniqBy";
import { useMemo } from "react";

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
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { useLocale } from "@/src";
import { useDashboardInteractiveFilters } from "@/stores/interactive-filters";

export const LayoutConfigurator = () => {
  return (
    <>
      <LayoutAnnotator />
      <LayoutLayoutConfigurator />
      <LayoutSharedFiltersConfigurator />
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
              <LayoutButton type="canvas" layout={layout} />
            </Box>
          </ControlSectionContent>
        </ControlSection>
      );
    default:
      return null;
  }
};

const LayoutSharedFiltersConfigurator = () => {
  const [state, dispatch] = useConfiguratorState(isLayouting);
  const { layout } = state;
  const { sharedFilters } = useDashboardInteractiveFilters();
  const locale = useLocale();
  const cubeFilters = useMemo(() => {
    return uniqBy(
      state.chartConfigs.flatMap((config) =>
        config.cubes.map((x) => ({
          iri: x.iri,
        }))
      ),
      "iri"
    );
  }, [state.chartConfigs]);
  const [data] = useDataCubesComponentsQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale: locale,
      cubeFilters: cubeFilters,
    },
  });
  const dimensionsByIri = useMemo(() => {
    return keyBy(data.data?.dataCubesComponents.dimensions, (x) => x.iri);
  }, [data.data?.dataCubesComponents.dimensions]);
  const handleToggle: SwitchProps["onChange"] = useEventCallback(
    (event, checked) => {
      const componentIri = event.currentTarget.dataset.componentIri;
      if (!componentIri) return;
      if (checked) {
        dispatch({
          type: "DASHBOARD_FILTER_ADD",
          value: {
            type: "timeRange",
            active: true,
            presets: {
              type: "range",
              // TODO Ignored at this point, is computed by the getSharedFilters helper
              from: "0000-01-01",
              to: "0000-12-31",
            },
            componentIri: componentIri,
          },
        });
      } else {
        dispatch({
          type: "DASHBOARD_FILTER_REMOVE",
          value: componentIri,
        });
      }
    }
  );

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
            <Trans id="controls.section.shared-filters">Shared filters</Trans>
          </SubsectionTitle>
          <Stack gap="0.5rem" px="1rem">
            {sharedFilters.map((filter) => {
              return (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                  key={filter.iri}
                >
                  <Typography variant="body2" flexGrow={1}>
                    {dimensionsByIri[filter.iri]?.label || filter.iri}
                  </Typography>
                  <FormControlLabel
                    sx={{ mr: 0 }}
                    labelPlacement="start"
                    disableTypography
                    label={
                      <Typography variant="body2">
                        <Trans id="controls.section.shared-filters.shared-switch">
                          Shared
                        </Trans>
                      </Typography>
                    }
                    control={
                      <Switch
                        checked={filter.value?.active ?? false}
                        onChange={handleToggle}
                        inputProps={{
                          // @ts-ignore
                          "data-component-iri": filter.iri,
                        }}
                      />
                    }
                  />
                </Box>
              );
            })}
          </Stack>
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
  if (newLayoutType === "canvas") {
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
