import { Trans } from "@lingui/react";
import { interpolatePurples, interpolateRdYlGn } from "d3-scale-chromatic";
import { ReactNode } from "react";

import Flex from "@/components/flex";
import { Label } from "@/components/form";
import { CustomPaletteType } from "@/config-types";
import { ColorSquare } from "@/configurator/components/chart-controls/color-palette";
import { ColorRamp } from "@/configurator/components/chart-controls/color-ramp";

type ColorPaletteExampleProps = {
  type: CustomPaletteType["type"];
};

const categoricalExamplePalette = [
  "#663778",
  "#FF9900",
  "#FF5F55",
  "#3F7397",
  "#00B040",
  "#9F2020",
  "#BCBD21",
];

export const ColorPaletteExample = ({ type }: ColorPaletteExampleProps) => {
  let example: ReactNode = null;

  switch (type) {
    case "sequential":
      example = (
        <ColorRamp
          height={20}
          width={146}
          colorInterpolator={interpolatePurples}
        />
      );
      break;
    case "diverging":
      example = (
        <ColorRamp
          height={20}
          width={146}
          colorInterpolator={interpolateRdYlGn}
        />
      );
      break;

    case "categorical":
      example = (
        <Flex gap={"1px"}>
          {categoricalExamplePalette.map((color) => (
            <ColorSquare key={`option-${color}`} color={color} />
          ))}
        </Flex>
      );
      break;

    default:
      const _exhaustiveCheck: never = type;
      return _exhaustiveCheck;
  }

  return (
    <Flex flexDirection={"column"}>
      <Label htmlFor="custom-color-palette-example" smaller sx={{ mb: 1 }}>
        <Trans id="controls.custom-color-palettes.example" />
      </Label>
      {example}
    </Flex>
  );
};
