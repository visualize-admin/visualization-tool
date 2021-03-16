import { Trans } from "@lingui/macro";
import React, { memo, ReactNode, useEffect, useMemo, useState } from "react";
import { Box, Flex } from "theme-ui";
import {
  feature as topojsonFeature,
  mesh as topojsonMesh,
} from "topojson-client";
import { Select } from "../../components/form";
import { HintBlue, LoadingOverlay, NoDataHint } from "../../components/hint";
import { FieldProps, MapBaseLayer, MapFields } from "../../configurator";
import {
  ControlTabButton,
  ControlTabButtonInner,
} from "../../configurator/components/chart-controls/control-tab";
import { ControlSection } from "../../configurator/components/chart-controls/section";
import { getIconName } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { ComponentFieldsFragment } from "../../graphql/query-hooks";
import { IconName } from "../../icons/components";
import { ChartContainer } from "../shared/containers";
import { MapComponent } from "./map";
import { MapLegend } from "./map-legend";
import { GeoData, MapChart } from "./map-state";
import { MapTooltip } from "./map-tooltip";
import { PrototypeRightControls } from "./prototype-right-controls";

type GeoDataState =
  | {
      state: "fetching";
    }
  | {
      state: "error";
    }
  | (GeoData & { state: "loaded" });

type DataState =
  | {
      state: "fetching";
    }
  | {
      state: "error";
    }
  | {
      state: "loaded";
      ds: Observation[];
    };
type PaletteType = "continuous" | "discrete";

export const ChartMapVisualization = () => {
  const [geoData, setGeoData] = useState<GeoDataState>({ state: "fetching" });
  const [dataset, loadDataset] = useState<DataState>({ state: "fetching" });

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const res = await fetch(`/topojson/ch-2020.json`);
        const topo = await res.json();

        const cantons = topojsonFeature(topo, topo.objects.cantons);
        const cantonMesh = topojsonMesh(topo, topo.objects.cantons);
        const lakes = topojsonFeature(topo, topo.objects.lakes);

        setGeoData({
          state: "loaded",
          cantons,
          cantonMesh,
          lakes,
        });
      } catch (e) {
        setGeoData({ state: "error" });
      }
    };
    loadGeoData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/map-data/tidy/holzernte.json`);
        const ds = await res.json();

        loadDataset({
          state: "loaded",
          ds,
        });
      } catch (e) {
        loadDataset({ state: "error" });
      }
    };
    loadData();
  }, []);

  if (geoData.state === "fetching" || dataset.state === "fetching") {
    return <LoadingOverlay />;
  } else if (geoData.state === "error" || dataset.state === "error") {
    return <NoDataHint />;
  } else {
    const dimensions = Object.keys(dataset.ds[0])
      .filter((d) => d.startsWith("D_"))
      .map((d) => ({
        __typename: "NominalDimension",
        iri: d,
        label: d,
        dimensionValues: [...new Set(dataset.ds.map((datum) => datum[d]))],
      })) as Array<ComponentFieldsFragment & { dimensionValues: string[] }>;
    const measures = Object.keys(dataset.ds[0])
      .filter((d) => d.startsWith("M_"))
      .map((d) => ({
        __typename: "Measure",
        iri: d,
        label: d,
      })) as ComponentFieldsFragment[];
    const attributes = Object.keys(dataset.ds[0])
      .filter((d) => d.startsWith("A_"))
      .map((d) => ({
        __typename: "Attribute",
        iri: d,
        label: d,
      })) as ComponentFieldsFragment[];

    return (
      <ChartMapPrototype
        dataset={dataset.ds}
        features={geoData}
        dimensions={dimensions}
        measures={measures}
        attributes={attributes}
      />
    );
  }
};

export type Control = "baseLayer" | "areaLayer" | "symboLayer";
export type ActiveLayer = {
  relief: boolean;
  lakes: boolean;
  areaLayer: boolean;
  symboLayer: boolean;
};
export const ChartMapPrototype = ({
  dataset,
  features,
  dimensions,
  measures,
  attributes,
}: {
  dataset: Observation[];
  features: GeoData;
  dimensions: Array<ComponentFieldsFragment & { dimensionValues: string[] }>;
  measures: ComponentFieldsFragment[];
  attributes: ComponentFieldsFragment[];
}) => {
  const [activeLayers, setActiveLayers] = useState<ActiveLayer>({
    relief: true,
    lakes: true,
    areaLayer: false,
    symboLayer: false,
  });
  const [activeControl, setActiveControl] = useState<Control>("baseLayer");
  const [palette, setPalette] = useState("oranges");
  const [nbSteps, setNbSteps] = useState(5);
  const [paletteType, setPaletteType] = useState<PaletteType>("continuous");
  const [measure, setMeasure] = useState(measures[0].iri);
  const [filters, setFilters] = useState<{ [x: string]: string }>(
    dimensions.reduce(
      (obj, dim, i) => ({ ...obj, [dim.iri]: dim.dimensionValues[0] }),
      {}
    )
  );

  const updateActiveLayers = (layerKey: keyof ActiveLayer) => {
    setActiveLayers({
      ...activeLayers,
      ...{ [layerKey]: !activeLayers[layerKey] },
    });
  };
  const updateFilters = (filterKey: string, filterValue: string) => {
    setFilters({ ...filters, ...{ [filterKey]: filterValue } });
  };

  // Apply filters to data used on the map
  const data = useMemo(() => {
    const filterfunctions = Object.keys(
      filters
    ).map((filterKey) => (x: Observation) =>
      x[filterKey] === filters[filterKey]
    );
    return filterfunctions.reduce((d, f) => d.filter(f), dataset);
  }, [dataset, filters]);

  return (
    <>
      <Box sx={{ bg: "monochrome100", borderRight: "1px solid #dfdfdf" }}>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Trans id="chart.map.control.base.map">Layers</Trans>
            </Box>
            <Tab
              value="baseLayer"
              onClick={(v) => setActiveControl(v)}
              iconName="mapMaptype"
              upperLabel={""}
              lowerLabel={"Base Layer"}
              checked={activeControl === "baseLayer"}
              disabled={false}
            />
            <Tab
              value="areaLayer"
              onClick={(v) => setActiveControl(v)}
              iconName="mapRegions"
              upperLabel={""}
              lowerLabel={"Area Layer"}
              checked={activeControl === "areaLayer"}
              disabled={false}
            />
            <Tab
              value="symboLayer"
              onClick={(v) => setActiveControl(v)}
              iconName="mapSymbols"
              upperLabel={""}
              lowerLabel={"Symbol Layer"}
              checked={activeControl === "symboLayer"}
              disabled={true}
            />
          </Box>
        </ControlSection>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Trans id="chart.map.control.data.filters">Data Filters</Trans>
            </Box>
            <Flex sx={{ flexDirection: "column" }}>
              {dimensions.map((dim) => (
                <Box sx={{ mb: 2 }} key={dim.iri}>
                  <Select
                    label={dim.label.split("_")[1]}
                    id={dim.label}
                    name={dim.label}
                    value={filters[dim.iri]}
                    disabled={false}
                    options={dim.dimensionValues.map((value) => ({
                      value,
                      label: value,
                    }))}
                    onChange={(e) =>
                      updateFilters(dim.iri, e.currentTarget.value)
                    }
                  />
                </Box>
              ))}
            </Flex>
          </Box>
        </ControlSection>
      </Box>

      <Box>
        <HintBlue iconName="hintWarning">
          <Trans id="chart.map.warning.prototype">
            This is a prototype, don't use in production!
          </Trans>
        </HintBlue>
        <Box sx={{ m: 4, bg: "#FFFFFF", border: "1px solid #dfdfdf" }}>
          {dimensions && measures && data && (
            <ChartMap
              observations={data}
              features={features}
              fields={{
                baseLayer: {
                  componentIri: "",
                  relief: activeLayers.relief,
                  lakes: activeLayers.lakes,
                },
                areaLayer: {
                  componentIri: measure,
                  display: activeLayers["areaLayer"],
                  label: { componentIri: attributes[0].iri },
                  palette,
                  nbSteps,
                  paletteType,
                },
                x: { componentIri: "a" },
                y: { componentIri: "b" },
                segment: { componentIri: "c" },
              }}
              dimensions={dimensions}
              measures={measures}
              // Additional props (prototype only)
              measure={measure.split("_")[1]}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ bg: "monochrome100", borderLeft: "1px solid #dfdfdf" }}>
        <PrototypeRightControls
          activeControl={activeControl}
          measures={measures}
          measure={measure}
          setMeasure={setMeasure}
          palette={palette}
          setPalette={setPalette}
          paletteType={paletteType}
          setPaletteType={setPaletteType}
          nbSteps={nbSteps}
          setNbSteps={setNbSteps}
          activeLayers={activeLayers}
          updateActiveLayers={updateActiveLayers}
        />
      </Box>
    </>
  );
};

export const ChartMap = memo(
  ({
    observations,
    features,
    dimensions,
    measures,
    fields,
    measure,
  }: {
    features: GeoData;
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    // Additional props (prototype only)
    fields: MapFields;
    measure: string;
  }) => {
    return (
      <MapChart
        data={observations}
        features={features}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
      >
        <ChartContainer>
          <MapComponent />
          <MapTooltip />
        </ChartContainer>
        <MapLegend legendTitle={measure} />
      </MapChart>
    );
  }
);

// Light version of ControlTab (only for prototype)
const Tab = ({
  value,
  onClick,
  iconName,
  upperLabel,
  lowerLabel,
  checked,
  disabled,
}: {
  disabled?: boolean;
  onClick: (x: Control) => void;
  value: Control;
  upperLabel: ReactNode;
  lowerLabel: string;
  iconName?: IconName;
} & FieldProps) => (
  <Box
    sx={{
      width: "100%",
      borderRadius: "default",
      my: "2px",
      pointerEvents: disabled ? "none" : "unset",
    }}
  >
    <ControlTabButton
      checked={checked}
      value={value}
      onClick={() => onClick(value)}
    >
      <ControlTabButtonInner
        iconName={iconName ?? getIconName(value)}
        upperLabel={upperLabel}
        lowerLabel={lowerLabel}
        checked={checked}
        optional={disabled}
      />
    </ControlTabButton>
  </Box>
);
