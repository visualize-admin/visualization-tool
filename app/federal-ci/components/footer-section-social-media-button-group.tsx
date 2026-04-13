import { Box, styled } from "@mui/material";

import { b, s } from "@/federal-ci/theme";

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
