import { t } from "@lingui/macro";
import { Link, styled } from "@mui/material";
import { visuallyHidden } from "@mui/utils";

export const MAIN_CONTENT_ID = "main";

export const SkipLink = () => {
  return (
    <SkipLinkRoot href={`#${MAIN_CONTENT_ID}`}>
      {t({ id: "skip-link.main-content", message: "Skip to main content" })}
    </SkipLinkRoot>
  );
};

const SkipLinkRoot = styled(Link)(({ theme }) => ({
  ...visuallyHidden,

  "&:focus": {
    position: "static",
    alignSelf: "flex-start",
    width: "auto",
    height: "auto",
    margin: theme.spacing(2),
    padding: theme.spacing(1, 2),
    overflow: "visible",
    clip: "auto",
    whiteSpace: "normal",
    ...theme.typography.body2,
  },
}));
