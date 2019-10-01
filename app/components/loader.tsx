import * as React from "react";
import { Box } from "rebass";

export const Loader = ({ body }: { body: string }) => (
  <Box fontSize={4} style={{ fontFamily: "FrutigerNeueRegular" }}>
    {body}
  </Box>
);
