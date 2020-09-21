import { markdown, ReactSpecimen } from "catalog";
import { ChartTypeSelectionButton } from "../components/chart-controls/chart-type-radio-button";
import { ControlList } from "../components/chart-controls/list";
import {
  ControlSection,
  SectionTitle,
} from "../components/chart-controls/section";
import { Checkbox, Input, Radio, Select } from "../components/form";
import {
  ColorPicker,
  ColorPickerMenu,
} from "../components/chart-controls/color-picker";
import { getPalette } from "../domain/helpers";
import { useState } from "react";
import { Box } from "theme-ui";

// const vegaPalettes: Array<{ id: vega.ColorScheme; values: Array<string> }> = [
//   { id: "category10", values: vega.scheme("category10") },
//   { id: "accent", values: vega.scheme("accent") },
//   { id: "pastel1", values: vega.scheme("pastel1") },
//   { id: "pastel2", values: vega.scheme("pastel2") },
//   { id: "dark2", values: vega.scheme("dark2") }
// ];

// const palettes = ["category10", "accent", "pastel1", "pastel2", "dark2"];
export default () => {
  const [currentColor, setCurrentColor] = useState(getPalette("accent")[0]);

  return markdown`

> Controls are a composition of layout components and form elements, used throughout the application to configurate charts.

## Chart Type Selector
  ${(
    <ReactSpecimen span={2}>
      <ChartTypeSelectionButton
        label={"line"}
        name={"Linien"}
        value={"Linien"}
        onClick={(e) => {
          console.log(e.currentTarget.value);
        }}
      />
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <ChartTypeSelectionButton
        label={"scatterplot"}
        name={"Scatterplot"}
        value={"Scatterplot"}
        checked={true}
        onClick={(e) => {
          console.log(e.currentTarget.value);
        }}
      />
    </ReactSpecimen>
  )}

## Controls section
A section is a styling container, it has a title and a note (displayed on the right). Any component can be given as child component.
${(
  <ReactSpecimen span={6}>
    <ControlSection>
      <SectionTitle>Werteachse</SectionTitle>
      <ControlList>
        <Select
          id="foo"
          options={[
            { label: "Kanton", value: "Kanton" },
            { label: "Eigentümertyp", value: "Eigentümertyp" },
          ]}
        />
        <Select
          id="bar"
          options={[
            { label: "Kanton", value: "Kanton" },
            { label: "Eigentümertyp", value: "Eigentümertyp" },
          ]}
        />
      </ControlList>
      <ControlList>
        <Input />
      </ControlList>

      <ControlList>
        <Checkbox
          label={"Bern"}
          checked={true}
          name={"Bern"}
          value={"Bern"}
          onChange={() => {}}
        />
        <Checkbox
          label={"Aargau"}
          name={"Aargau"}
          value={"Aargau"}
          onChange={() => {}}
        />
        <Checkbox
          label={"Ticino"}
          name={"Ticino"}
          value={"Ticino"}
          onChange={() => {}}
        />
      </ControlList>
      <ControlList>
        <Radio
          label={"Bern"}
          checked={true}
          name={"Bern"}
          value={"Bern"}
          onChange={() => {}}
        />
        <Radio
          label={"Aargau"}
          name={"Aargau"}
          value={"Aargau"}
          onChange={() => {}}
        />
        <Radio
          label={"Ticino"}
          name={"Ticino"}
          value={"Ticino"}
          onChange={() => {}}
        />
      </ControlList>
    </ControlSection>
  </ReactSpecimen>
)}
## Controls list

${(
  <ReactSpecimen span={2}>
    <ControlList>
      <Checkbox
        label={"Scatterplot"}
        name={"Scatterplot"}
        value={"Scatterplot"}
        onChange={() => {}}
      />
      <Checkbox
        label={"Line Chart"}
        name={"Line Chart"}
        value={"Line Chart"}
        onChange={() => {}}
      />
      <Checkbox
        label={"Bar chart"}
        name={"Bar chart"}
        value={"Bar chart"}
        onChange={() => {}}
      />
    </ControlList>
  </ReactSpecimen>
)}

## Color Picker

${(
  <ReactSpecimen span={2}>
    <>
      <Box sx={{ p: 4, mb: 2, color: "white", bg: currentColor }}>
        Current (valid) color: {currentColor}
      </Box>
      <ColorPicker
        colors={getPalette("accent")}
        selectedColor={currentColor}
        onChange={(color) => setCurrentColor(color)}
      />
    </>
  </ReactSpecimen>
)}

${(
  <ReactSpecimen span={2}>
    <>
      <Box sx={{ p: 4, mb: 2, color: "white", bg: currentColor }}>
        Current (valid) color: {currentColor}
      </Box>
      <ColorPickerMenu
        colors={getPalette("accent")}
        selectedColor={currentColor}
        onChange={(color) => setCurrentColor(color)}
      />
    </>
  </ReactSpecimen>
)}
`;
};
