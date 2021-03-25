import { Trans } from "@lingui/macro";
import React from "react";
import { Box } from "theme-ui";
import { Checkbox, Radio, Select } from "../../components/form";
import { PaletteType } from "../../configurator";
import { ControlSection } from "../../configurator/components/chart-controls/section";
import { ComponentFieldsFragment } from "../../graphql/query-hooks";
import { ActiveLayer, Control } from "./chart-map-prototype";
import { Label } from "./prototype-components";

export const PrototypeRightControls = ({
  activeControl,
  activeLayers,
  updateActiveLayers,
  measures,
  measure,
  setMeasure,
  palette,
  setPalette,
  paletteType,
  setPaletteType,
  nbClass,
  setNbClass,
  symbolMeasure,
  setSymbolMeasure,
}: {
  activeControl: Control;
  activeLayers: ActiveLayer;
  updateActiveLayers: (x: keyof ActiveLayer) => void;
  measures: ComponentFieldsFragment[];
  measure: string;
  setMeasure: (x: string) => void;
  palette: string;
  setPalette: (x: string) => void;
  paletteType: string;
  setPaletteType: (x: PaletteType) => void;
  nbClass: number;
  setNbClass: (x: number) => void;
  symbolMeasure: string;
  setSymbolMeasure: (x: string) => void;
}) => {
  if (activeControl === "baseLayer") {
    return (
      <>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Checkbox
              label={<Trans id="chart.map.layers.base.relief">Relief</Trans>}
              name={"relief"}
              value={"relief"}
              checked={activeLayers.relief}
              disabled={false}
              onChange={() => updateActiveLayers("relief")}
            />
            <Checkbox
              label={<Trans id="chart.map.layers.base.lakes">Lakes</Trans>}
              name={"lakes"}
              value={"lakes"}
              checked={activeLayers.lakes}
              disabled={false}
              onChange={() => updateActiveLayers("lakes")}
            />
          </Box>
        </ControlSection>
      </>
    );
  } else if (activeControl === "areaLayer") {
    return (
      <>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Checkbox
              label={
                <Trans id="chart.map.layers.area.add.data">Map data</Trans>
              }
              name={"areaLayer"}
              value={"areaLayer"}
              checked={activeLayers.areaLayer}
              disabled={false}
              onChange={() => updateActiveLayers("areaLayer")}
            />
          </Box>
        </ControlSection>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Select
              label={
                <Trans id="chart.map.layers.area.select.measure">
                  Select a measure to map
                </Trans>
              }
              id={"measure-select"}
              name={"measure-select"}
              value={measure}
              disabled={!activeLayers.areaLayer}
              options={measures.map((m) => ({
                value: m.iri,
                label: m.label.split("_")[1],
              }))}
              onChange={(e) => setMeasure(e.currentTarget.value)}
            />
          </Box>
        </ControlSection>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Select
              label={
                <Trans id="chart.map.layers.area.color.palette">
                  Color palette
                </Trans>
              }
              id={"palette"}
              name={"palette"}
              value={palette}
              disabled={!activeLayers.areaLayer}
              options={[
                { value: "oranges", label: "oranges" },
                { value: "reds", label: "reds" },
                { value: "purples", label: "purples" },
                { value: "greens", label: "greens" },
                { value: "blues", label: "blues" },
                { value: "greys", label: "greys" },
              ]}
              onChange={(e) => setPalette(e.currentTarget.value)}
            ></Select>
          </Box>
        </ControlSection>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Label label="Continuous" smaller></Label>
            <Radio
              label={
                <Trans id="chart.map.layers.area.discretization.linear">
                  Linear interpolation
                </Trans>
              }
              name={"continuous"}
              value={"continuous"}
              checked={paletteType === "continuous"}
              disabled={!activeLayers.areaLayer}
              onChange={(e) => {
                setPaletteType(e.currentTarget.value as PaletteType);
              }}
            />
            <Label label="Discrete" smaller></Label>
            <Radio
              label={
                <Trans id="chart.map.layers.area.discretization.quantize">
                  Quantize (equal intervals)
                </Trans>
              }
              name={"discrete"}
              value={"discrete"}
              checked={paletteType === "discrete"}
              disabled={!activeLayers.areaLayer}
              onChange={(e) =>
                setPaletteType(e.currentTarget.value as PaletteType)
              }
            />
            <Radio
              label={
                <Trans id="chart.map.layers.area.discretization.quantiles">
                  Quantiles (equal frequency)
                </Trans>
              }
              name={"quantile"}
              value={"quantile"}
              checked={paletteType === "quantile"}
              disabled={!activeLayers.areaLayer}
              onChange={(e) =>
                setPaletteType(e.currentTarget.value as PaletteType)
              }
            />
            <Radio
              label={
                <Trans id="chart.map.layers.area.discretization.jenks">
                  Jenks (natural breaks)
                </Trans>
              }
              name={"jenks"}
              value={"jenks"}
              checked={paletteType === "jenks"}
              disabled={!activeLayers.areaLayer}
              onChange={(e) =>
                setPaletteType(e.currentTarget.value as PaletteType)
              }
            />
            <Select
              label={
                <Trans id="chart.map.layers.area.discretization.number.class">
                  Number of classes
                </Trans>
              }
              id={"nbClass"}
              name={"nbClass"}
              value={`${nbClass}`}
              disabled={!activeLayers.areaLayer || paletteType === "continuous"}
              options={[
                { value: "3", label: "3" },
                { value: "4", label: "4" },
                { value: "5", label: "5" },
                { value: "6", label: "6" },
                { value: "7", label: "7" },
                { value: "8", label: "8" },
                { value: "9", label: "9" },
              ]}
              onChange={(e) => setNbClass(+e.currentTarget.value)}
            ></Select>
          </Box>
        </ControlSection>
      </>
    );
  } else if (activeControl === "symbolLayer") {
    return (
      <>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Checkbox
              label={
                <Trans id="chart.map.layers.symbol.add.symbols">
                  Add proportional circles
                </Trans>
              }
              name={"symbolLayer"}
              value={"symbolLayer"}
              checked={activeLayers.symbolLayer}
              disabled={false}
              onChange={() => updateActiveLayers("symbolLayer")}
            />
          </Box>
        </ControlSection>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Select
              label={
                <Trans id="chart.map.layers.symbol.select.measure">
                  Select a measure
                </Trans>
              }
              id={"symbol-measure-select"}
              name={"symbol-measure-select"}
              value={symbolMeasure}
              disabled={!activeLayers.symbolLayer}
              options={measures.map((m) => ({
                value: m.iri,
                label: m.label.split("_")[1],
              }))}
              onChange={(e) => setSymbolMeasure(e.currentTarget.value)}
            />
          </Box>
        </ControlSection>
      </>
    );
  } else {
    return (
      <Trans id="chart.map.layers.no.selected">
        Select a layer to edit in the left panel.
      </Trans>
    );
  }
};
