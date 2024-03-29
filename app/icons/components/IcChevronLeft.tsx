import { Box, BoxProps } from "@mui/material";
import * as React from "react";

function SvgIcChevronLeft(
  props: React.SVGProps<SVGSVGElement> & { sx?: BoxProps["sx"] }
) {
  return (
    /** @ts-ignore */
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
      sx={props.sx}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M9.707 12L15 6.5 13.5 5 7 12l6.5 7 1.5-1.5z"
        />
      </g>
    </Box>
  );
}

export default SvgIcChevronLeft;
