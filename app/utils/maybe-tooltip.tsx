import { Tooltip, Typography } from "@mui/material";

export const MaybeTooltip = ({
  text,
  children,
}: {
  text?: string;
  children: JSX.Element;
}) => {
  return text ? (
    <Tooltip arrow title={<Typography variant="body2">{text}</Typography>}>
      {children}
    </Tooltip>
  ) : (
    children
  );
};
