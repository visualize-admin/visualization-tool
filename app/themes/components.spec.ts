import { getContrastRatio } from "@mui/material/styles";
import { describe, expect, it } from "vitest";

import { FOCUS_OUTLINE_COLOR_ON_DARK_SURFACE } from "@/federal-ci/components/common";
import { c } from "@/federal-ci/theme";
import { SWITCH_COLORS } from "@/themes/components";
import { FOCUS_OUTLINE_COLOR } from "@/themes/focus";
import { palette } from "@/themes/palette";

const BACKGROUNDS = ["#fff", palette.monochrome[100], palette.cobalt[50]];
const DARK_SURFACES = [c.cobalt[600], c.cobalt[700]];
const NON_TEXT_CONTRAST = 3;

describe("theme a11y", () => {
  it.each([
    ["focus outline", FOCUS_OUTLINE_COLOR],
    ["unchecked switch", SWITCH_COLORS.unchecked],
    ["checked switch track", SWITCH_COLORS.checkedTrack],
  ])("gives the %s ≥ 3:1 contrast against backgrounds", (_, color) => {
    for (const background of BACKGROUNDS) {
      expect(getContrastRatio(color, background)).toBeGreaterThanOrEqual(
        NON_TEXT_CONTRAST
      );
    }
  });

  it("gives the dark surface focus outline ≥ 3:1 contrast", () => {
    for (const surface of DARK_SURFACES) {
      expect(
        getContrastRatio(FOCUS_OUTLINE_COLOR_ON_DARK_SURFACE, surface)
      ).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);
    }
  });

  it("gives the checked switch thumb ≥ 3:1 contrast against its track", () => {
    expect(
      getContrastRatio(SWITCH_COLORS.checkedThumb, SWITCH_COLORS.checkedTrack)
    ).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);
  });
});
