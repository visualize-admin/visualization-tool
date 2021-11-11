import { Box, BoxProps } from "@theme-ui/components";
import React from "react";

const Breadcrumbs = ({
  breadcrumbs,
  Breadcrumb,
  onClickBreadcrumb,
  ...boxProps
}: {
  breadcrumbs: any;
  Breadcrumb: React.ElementType<{ breadcrumb: any; onClick: () => void }>;
  onClickBreadcrumb?: (i: number) => void;
} & BoxProps) => {
  return (
    <Box {...boxProps}>
      {breadcrumbs
        ? breadcrumbs.map((b: any, i: number) => (
            <>
              <Breadcrumb
                key={i}
                breadcrumb={b}
                onClick={() => onClickBreadcrumb(i)}
              />
              {i < breadcrumbs.length - 1 ? (
                <Box sx={{ display: "inline-block", ml: 2, mr: 2 }}>{">"}</Box>
              ) : null}
            </>
          ))
        : null}
    </Box>
  );
};

export default Breadcrumbs;
