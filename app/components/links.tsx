import { Link as UILink } from "@mui/material";

import { Icon, IconName } from "@/icons";

export const IconLink = ({
  iconName,
  href,
  title,
}: {
  iconName: IconName;
  title?: string;
  href: string;
}) => (
  <UILink
    title={title}
    // disabled={disabled}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      ml: 4,
      color: "primary",
      "&:disabled": {
        color: "primary.disabled",
      },
      "&:hover": {
        color: "primary.dark",
      },
      "&:active": {
        color: "primary.active",
      },
      "&:visited": {
        color: "primary",
      },
    }}
  >
    <Icon name={iconName}></Icon>
  </UILink>
);
