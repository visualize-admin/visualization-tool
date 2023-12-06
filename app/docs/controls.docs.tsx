import { Box } from "@mui/material";
import { markdown, ReactSpecimen } from "catalog";
import { useState } from "react";

import { Checkbox, Input, Radio, Select } from "@/components/form";
import {
  ColorPicker,
  ColorPickerMenu,
} from "@/configurator/components/chart-controls/color-picker";
import { OnOffControlTab } from "@/configurator/components/chart-controls/control-tab";
import { ControlList } from "@/configurator/components/chart-controls/list";
import {
  ControlSection,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { IconButton } from "@/configurator/components/icon-button";
import { getPalette } from "@/palettes";

const ControlsDoc = () => {
  const [currentColor, setCurrentColor] = useState(getPalette("accent")[0]);

  return markdown`

> Controls are a composition of layout components and form elements, used throughout the application to configurate charts.

## Chart Type Selector
  ${(
    <ReactSpecimen span={2}>
      <IconButton
        label="line"
        name="Linien"
        value="Linien"
        onClick={() => {}}
      />
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <IconButton
        label="scatterplot"
        name="Scatterplot"
        value="Scatterplot"
        checked
        onClick={() => {}}
      />
    </ReactSpecimen>
  )}

## OnOffControlTab
OnOffControlTab (and OnOffControlTabField) are elements which are supposed to be used on the left panel in the app as category "switches"
(like for BaseLayer in case of maps or InteractiveFilters for... interactive filters). They display either "on" or "off" to indicate component state.


  ${(
    <ReactSpecimen span={2}>
      <OnOffControlTab
        value="Test"
        label={<span>Test</span>}
        icon="settings"
        onClick={() => {}}
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
          label="Bern"
          checked
          name="Bern"
          value="Bern"
          onChange={() => {}}
        />
        <Checkbox
          label="Aargau"
          name="Aargau"
          value="Aargau"
          onChange={() => {}}
        />
        <Checkbox
          label="Ticino"
          name="Ticino"
          value="Ticino"
          onChange={() => {}}
        />
      </ControlList>
      <ControlList>
        <Radio
          label="Bern"
          checked
          name="Bern"
          value="Bern"
          onChange={() => {}}
        />
        <Radio
          label="Aargau"
          name="Aargau"
          value="Aargau"
          onChange={() => {}}
        />
        <Radio
          label="Ticino"
          name="Ticino"
          value="Ticino"
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
        label="Scatterplot"
        name="Scatterplot"
        value="Scatterplot"
        onChange={() => {}}
      />
      <Checkbox
        label="Line Chart"
        name="Line Chart"
        value="Line Chart"
        onChange={() => {}}
      />
      <Checkbox
        label="Bar chart"
        name="Bar chart"
        value="Bar chart"
        onChange={() => {}}
      />
    </ControlList>
  </ReactSpecimen>
)}

## Color Picker

${(
  <ReactSpecimen span={2}>
    <>
      <Box sx={{ p: 4, mb: 2, color: "white", backgroundColor: currentColor }}>
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
      <Box sx={{ p: 4, mb: 2, color: "white", backgroundColor: currentColor }}>
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

export default ControlsDoc;
