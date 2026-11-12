import { t } from "@lingui/macro";
import { Link, styled } from "@mui/material";

export const MAIN_CONTENT_ID = "main";

export const SkipLink = () => {
  return (
    <SkipLinkRoot href={`#${MAIN_CONTENT_ID}`}>
      {t({ id: "skip-link.main-content", message: "Skip to main content" })}
    </SkipLinkRoot>
  );
};

const SkipLinkRoot = styled(Link)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: theme.zIndex.tooltip + 1,
  padding: theme.spacing(2, 4),
  backgroundColor: theme.palette.background.paper,
  ...theme.typography.body2,
  transform: "translateY(-200%)",

  "&:focus": {
    transform: "none",
  },
}));
