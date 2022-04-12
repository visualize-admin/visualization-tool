import { Link as UILink } from "@mui/material";
import { Icon, IconName } from "@/icons";

export const IconLink = ({
  iconName,
  href,
  title,
  disabled = false,
}: {
  iconName: IconName;
  title?: string;
  href: string;
  disabled?: boolean;
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
        color: "primary.hover",
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
