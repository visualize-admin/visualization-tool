import React from "react";
import { Box } from "theme-ui";
import { Checkbox, Radio, Select } from "../../components/form";
import { PaletteType } from "../../configurator";
import { ControlSection } from "../../configurator/components/chart-controls/section";
import { ComponentFieldsFragment } from "../../graphql/query-hooks";
import { ActiveLayer, Control } from "./chart-map-prototype";

export const PrototypeRightControls = ({
  activeControl,
  measures,
  measure,
  setMeasure,
  palette,
  setPalette,
  paletteType,
  setPaletteType,
  nbSteps,
  setNbSteps,
  activeLayers,
  updateActiveLayers,
}: {
  activeControl: Control;
  measures: ComponentFieldsFragment[];
  measure: string;
  setMeasure: (x: string) => void;
  palette: string;
  setPalette: (x: string) => void;
  paletteType: string;
  setPaletteType: (x: PaletteType) => void;
  nbSteps: number;
  setNbSteps: (x: number) => void;
  activeLayers: ActiveLayer;
  updateActiveLayers: (x: keyof ActiveLayer) => void;
}) => {
  if (activeControl === "baseLayer") {
    return (
      <>
        <ControlSection>
          <Box sx={{ p: 4 }}>
            <Checkbox
              label={"Relief"}
              name={"relief"}
              value={"relief"}
              checked={activeLayers.relief}
              disabled={false}
              onChange={() => updateActiveLayers("relief")}
            />
            <Checkbox
              label={"Lakes"}
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
              label={"Map data"}
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
              label={"Select a measure to map"}
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
              label={"Farbpalette"}
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
            <Radio
              label={"Kontinuerlich"}
              name={"continuous"}
              value={"continuous"}
              checked={paletteType === "continuous"}
              disabled={!activeLayers.areaLayer}
              onChange={(e) => {
                setPaletteType(e.currentTarget.value as PaletteType);
              }}
            />
            <Radio
              label={"Sequentiell"}
              name={"discrete"}
              value={"discrete"}
              checked={paletteType === "discrete"}
              disabled={!activeLayers.areaLayer}
              onChange={(e) =>
                setPaletteType(e.currentTarget.value as PaletteType)
              }
            />
            <Select
              label={"Anzahl Schritte"}
              id={"nbSteps"}
              name={"nbSteps"}
              value={`${nbSteps}`}
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
              onChange={(e) => setNbSteps(+e.currentTarget.value)}
            ></Select>
          </Box>
        </ControlSection>
      </>
    );
  } else {
    return <div>coucou</div>;
  }
};
