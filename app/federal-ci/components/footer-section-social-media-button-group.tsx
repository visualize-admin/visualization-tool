import { Box, styled } from "@mui/material";
import { ComponentProps } from "react";

import { b, s } from "@/federal-ci/theme";

export type FooterSectionSocialMediaButtonGroupProps = ComponentProps<
  typeof FooterSectionSocialMediaButtonGroup
>;

export const FooterSectionSocialMediaButtonGroup = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  rowGap: s(2),
  columnGap: s(3),
  [b.up("lg")]: {
    rowGap: s(5),
    columnGap: s(2.5),
  },
});
