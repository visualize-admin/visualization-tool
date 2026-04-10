import { Box, styled } from "@mui/material";
import { ComponentProps } from "react";

import { c } from "@/federal-ci/theme";

export type FooterSectionProps = ComponentProps<typeof FooterSection>;

export const FooterSection = styled(Box)({
  color: c.monochrome[50],
});
