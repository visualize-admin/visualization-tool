import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CustomPaletteType,
  DivergingPaletteType,
  SequentialPaletteType,
} from "@/config-types";
import { Palette } from "@/palettes";

import {
  createColorId,
  getFittingColorInterpolator,
  hasEnoughContrast,
} from "./color-palette-utils";

vi.mock("nanoid", () => ({
  nanoid: (length: number) => "test".slice(0, length),
}));

describe("Color Utilities", () => {
  describe("hasEnoughContrast", () => {
    it("should correctly identify low contrast combinations", () => {
      expect(hasEnoughContrast("#FFFFFF", "#ffffffe6")).toBe(true);
      expect(hasEnoughContrast("#F0F0F0", "#ffffffe6")).toBe(true);
      expect(hasEnoughContrast("#EEEEEE", "#ffffffe6")).toBe(true);
    });

    it("should correctly identify high contrast combinations", () => {
      expect(hasEnoughContrast("#000000", "#ffffffe6")).toBe(false);
      expect(hasEnoughContrast("#333333", "#ffffffe6")).toBe(false);
      expect(hasEnoughContrast("#444444", "#ffffffe6")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(hasEnoughContrast("rgb(0,0,0)", "#ffffffe6")).toBe(false);
      expect(hasEnoughContrast("rgba(255,255,255,1)", "#ffffffe6")).toBe(true);
      expect(hasEnoughContrast("#000000")).toBe(false);
      expect(hasEnoughContrast("#FFFFFF")).toBe(true);
    });
  });

  describe("createColorId", () => {
    it("should generate a 4-character color ID", () => {
      const colorId = createColorId();
      expect(colorId).toBe("test");
      expect(colorId.length).toBe(4);
    });
  });

  describe("getFittingColorInterpolator", () => {
    const mockGetColorInterpolator = vi.fn(
      (paletteId) => (t: number) => `color-${paletteId}-${t}`
    );

    const sequentialPalette: Palette<SequentialPaletteType> = {
      label: "Blues",
      value: "blues",
      interpolator: (t: number) => `blues-${t}`,
    };

    const divergingPalette: Palette<DivergingPaletteType> = {
      label: "RdBu",
      value: "RdBu",
      interpolator: (t: number) => `rdbu-${t}`,
    };

    const customSequentialPalette: CustomPaletteType = {
      type: "sequential",
      paletteId: "custom-sequential",
      name: "Custom Sequential",
      colors: ["#ff0000", "#0000ff"],
    };

    const customDivergingPalette: CustomPaletteType = {
      type: "diverging",
      paletteId: "custom-diverging",
      name: "Custom Diverging",
      colors: ["#ff0000", "#0000ff", "#00ff00"],
    };

    const customCategoricalPalette: CustomPaletteType = {
      type: "categorical",
      paletteId: "custom-categorical",
      name: "Custom Categorical",
      colors: ["#ff0000", "#00ff00", "#0000ff"],
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should handle sequential color config", () => {
      const config = {
        color: {
          colors: ["#ff0000", "#0000ff"],
          paletteType: "sequential" as const,
          paletteId: "test-sequential",
        },
      };

      const interpolator = getFittingColorInterpolator(
        config,
        mockGetColorInterpolator
      );
      expect(interpolator(0.5)).toBeDefined();
      const color = interpolator(0.5);
      expect(typeof color).toBe("string");
      expect(color.startsWith("#") || color.startsWith("rgb")).toBe(true);
    });

    it("should handle diverging color config", () => {
      const config = {
        color: {
          colors: ["#ff0000", "#0000ff", "#00ff00"],
          paletteType: "diverging" as const,
          paletteId: "test-diverging",
        },
      };

      const interpolator = getFittingColorInterpolator(
        config,
        mockGetColorInterpolator
      );
      expect(interpolator(0.5)).toBeDefined();
      const color = interpolator(0.5);
      expect(typeof color).toBe("string");
      expect(color.startsWith("#") || color.startsWith("rgb")).toBe(true);
    });

    it("should use predefined sequential palette", () => {
      const config = {
        currentPalette: sequentialPalette,
      };

      const interpolator = getFittingColorInterpolator(
        config,
        mockGetColorInterpolator
      );
      expect(interpolator(0.5)).toBe("blues-0.5");
    });

    it("should use predefined diverging palette", () => {
      const config = {
        currentPalette: divergingPalette,
      };

      const interpolator = getFittingColorInterpolator(
        config,
        mockGetColorInterpolator
      );
      expect(interpolator(0.5)).toBe("rdbu-0.5");
    });

    it("should handle custom sequential palette", () => {
      const config = {
        customPalette: customSequentialPalette,
      };

      const interpolator = getFittingColorInterpolator(
        config,
        mockGetColorInterpolator
      );
      expect(interpolator(0.5)).toBeDefined();
      const color = interpolator(0.5);
      expect(typeof color).toBe("string");
      expect(color.startsWith("#") || color.startsWith("rgb")).toBe(true);
    });

    it("should handle custom diverging palette", () => {
      const config = {
        customPalette: customDivergingPalette,
      };

      const interpolator = getFittingColorInterpolator(
        config,
        mockGetColorInterpolator
      );
      expect(interpolator(0.5)).toBeDefined();
      const color = interpolator(0.5);
      expect(typeof color).toBe("string");
      expect(color.startsWith("#") || color.startsWith("rgb")).toBe(true);
    });

    it("should handle custom categorical palette by falling back to default", () => {
      const config = {
        customPalette: customCategoricalPalette,
      };

      const interpolator = getFittingColorInterpolator(
        config,
        mockGetColorInterpolator
      );
      expect(interpolator(0.5)).toBe("color-default-0.5");
      expect(mockGetColorInterpolator).toHaveBeenCalledWith("default");
    });

    it("should respect priority order: color > currentPalette > customPalette > defaultPalette", () => {
      const config = {
        color: {
          colors: ["#ff0000", "#0000ff"],
          paletteType: "sequential" as const,
          paletteId: "priority-test",
        },
        currentPalette: sequentialPalette,
        customPalette: customSequentialPalette,
        defaultPalette: sequentialPalette,
      };

      const interpolator = getFittingColorInterpolator(
        config,
        mockGetColorInterpolator
      );
      const color = interpolator(0.5);
      expect(typeof color).toBe("string");
      expect(color.startsWith("#") || color.startsWith("rgb")).toBe(true);
    });

    it("should fall back to default when no valid configuration is provided", () => {
      const config = {};
      const interpolator = getFittingColorInterpolator(
        config,
        mockGetColorInterpolator
      );
      expect(interpolator(0.5)).toBe("color-default-0.5");
      expect(mockGetColorInterpolator).toHaveBeenCalledWith("default");
    });

    it("should handle undefined color arrays in config", () => {
      const config = {
        color: {
          paletteId: "test-undefined-colors",
        },
      };

      const interpolator = getFittingColorInterpolator(
        config,
        mockGetColorInterpolator
      );
      expect(interpolator(0.5)).toBe(`color-test-undefined-colors-0.5`);
    });

    it("should validate interpolator output range", () => {
      const config = {
        currentPalette: sequentialPalette,
      };

      const interpolator = getFittingColorInterpolator(
        config,
        mockGetColorInterpolator
      );
      expect(interpolator(0)).toBeDefined();
      expect(interpolator(0.5)).toBeDefined();
      expect(interpolator(1)).toBeDefined();
    });
  });
});
