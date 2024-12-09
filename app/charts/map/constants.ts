import { schemeCategory10 } from "d3-scale-chromatic";

import {
  CategoricalColorField,
  FixedColorField,
  NumericalColorField,
  PaletteType,
} from "@/config-types";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { DimensionValue } from "@/domain/data";

export const DEFAULT_FIXED_COLOR_FIELD_OPACITY = 80;

export const DEFAULT_OTHER_COLOR_FIELD_OPACITY = 100;

export const DEFAULT_FIXED_COLOR_FIELD: FixedColorField = {
  type: "fixed",
  value: schemeCategory10[0],
  opacity: DEFAULT_FIXED_COLOR_FIELD_OPACITY,
};

export const getDefaultCategoricalColorField = ({
  id,
  palette,
  dimensionValues,
}: {
  id: string;
  palette: string;
  dimensionValues: DimensionValue[];
}): CategoricalColorField => ({
  type: "categorical",
  componentId: id,
  palette,
  colorMapping: mapValueIrisToColor({
    palette,
    dimensionValues,
  }),
  opacity: DEFAULT_OTHER_COLOR_FIELD_OPACITY,
});

export const getDefaultNumericalColorField = ({
  id,
  colorPalette = "oranges",
}: {
  id: string;
  colorPalette?: PaletteType;
}): NumericalColorField => ({
  type: "numerical",
  componentId: id,
  palette: colorPalette,
  scaleType: "continuous",
  interpolationType: "linear",
  opacity: 100,
});

export const DEFAULT_COLOR = [222, 222, 222, 125];

export const FLY_TO_DURATION = 500;

export const RESET_DURATION = 1500;
