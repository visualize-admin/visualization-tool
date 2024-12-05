import { Box } from "@mui/material";
import { useState } from "react";

import { Checkbox, Input, Radio, Select } from "@/components/form";
import { ColorPicker } from "@/configurator/components/chart-controls/color-picker";
import { OnOffControlTab as OnOffControlTabComponent } from "@/configurator/components/chart-controls/control-tab";
import { ControlList } from "@/configurator/components/chart-controls/list";
import {
  ControlSection,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { getPalette } from "@/palettes";

import { IconButton } from "../configurator/components/icon-button";

import type { Meta, StoryObj } from "@storybook/react";

type Story = StoryObj;
const meta: Meta = {
  component: IconButton,
  title: "components / Controls",
};

export default meta;

export const ChartTypeSelector: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, setState] = useState("Line");
    return (
      <Box display="flex" gap="1rem">
        <IconButton
          label="line"
          name="Line"
          value="Line"
          checked={state === "Line"}
          onClick={() => setState("Line")}
        />

        <IconButton
          label="scatterplot"
          name="Scatterplot"
          value="Scatterplot"
          checked={state === "Scatterplot"}
          onClick={() => setState("Scatterplot")}
        />
      </Box>
    );
  },
};

export const OnOffControlTab: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [active, setActive] = useState(false);
    return (
      <OnOffControlTabComponent
        value="Test"
        label={<span>Test</span>}
        icon="settings"
        active={active}
        checked={active}
        onClick={() => setActive((a) => !a)}
      />
    );
  },
};

const ControlSectionStory: Story = {
  render: () => (
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
  ),
};

const ControlListStory = {
  render: () => (
    <div>
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
    </div>
  ),
};

const ColorPickerStory = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [currentColor, setCurrentColor] = useState("#ff0000");
    return (
      <div>
        <Box
          sx={{ p: 4, mb: 2, color: "white", backgroundColor: currentColor }}
        >
          Current (valid) color: {currentColor}
        </Box>
        <ColorPicker
          colors={getPalette("accent")}
          selectedColor={currentColor}
          onChange={(color) => setCurrentColor(color)}
        />
      </div>
    );
  },
};

export {
  ColorPickerStory as ColorPicker,
  ControlListStory as ControlList,
  ControlSectionStory as ControlSection,
};
