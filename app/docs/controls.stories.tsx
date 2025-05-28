import { Box } from "@mui/material";
import { hexToHsva, HsvaColor, hsvaToHex } from "@uiw/react-color";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Checkbox, Input, Radio, Select } from "@/components/form";
import { OnOffControlTab as OnOffControlTabComponent } from "@/configurator/components/chart-controls/control-tab";
import {
  ControlSection,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { IconButton } from "@/configurator/components/icon-button";
import { createColorId } from "@/utils/color-palette-utils";

import type { Meta, StoryObj } from "@storybook/react";

// Have to import dynamically to avoid @uiw/react-color dependency issues with the server
const CustomColorPicker = dynamic(
  () =>
    import("../configurator/components/color-picker").then(
      (mod) => mod.CustomColorPicker
    ),
  {
    ssr: false,
  }
);

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
      <Input />
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
      <Radio
        label="Bern"
        checked
        name="Bern"
        value="Bern"
        onChange={() => {}}
      />
      <Radio label="Aargau" name="Aargau" value="Aargau" onChange={() => {}} />
      <Radio label="Ticino" name="Ticino" value="Ticino" onChange={() => {}} />
    </ControlSection>
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
        <CustomColorPicker
          defaultSelection={{ ...hexToHsva(currentColor), id: createColorId() }}
          onChange={(color: HsvaColor) => setCurrentColor(hsvaToHex(color))}
        />
      </div>
    );
  },
};

export {
  ColorPickerStory as ColorPicker,
  ControlSectionStory as ControlSection,
};
