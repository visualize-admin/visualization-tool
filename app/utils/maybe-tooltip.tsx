import { Tooltip } from "@mui/material";

export const MaybeTooltip = ({
  title,
  children,
}: {
  title?: JSX.Element;
  children: JSX.Element;
}) => {
  return title ? (
    <Tooltip arrow title={title}>
      {children}
    </Tooltip>
  ) : (
    children
  );
};
