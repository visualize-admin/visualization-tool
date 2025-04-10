import { t, Trans } from "@lingui/macro";
import { Button, Menu, Typography } from "@mui/material";
import { signIn, signOut } from "next-auth/react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { MenuActionItem } from "@/components/menu-action-item";
import { ADFS_PROFILE_URL } from "@/domain/env";
import { isVercelPreviewHost } from "@/flags/flag";
import { Icon } from "@/icons";
import { useUser } from "@/login/utils";
import { useLocale } from "@/src";
import { createMailtoLink } from "@/templates/email";
import { bugReportTemplates } from "@/templates/email/bug-report";
import {
  OWNER_ORGANIZATION_EMAIL,
  SUPPORT_EMAIL,
} from "@/templates/email/config";
import { featureRequestTemplates } from "@/templates/email/feature-request";

export const LoginMenu = () => {
  const user = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
  const [feedbackMenuOpen, setFeedbackMenuOpen] = useState(false);
  const paperEl = useRef<HTMLDivElement>(null);

  return (
    <div>
      {user ? (
        <>
          <Button
            variant="text"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              gap: 0.25,
              minWidth: 0,
              minHeight: 0,
              padding: 0,
              whiteSpace: "nowrap",
              color: "white",

              "&:hover": {
                color: "cobalt.100",
              },
            }}
          >
            {user.name}
            <Icon name="chevronDown" size={24} />
          </Button>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ ref: paperEl, sx: { mt: 3 } }}
            sx={{ "& .MuiLink-root": { pr: "64px !important" } }}
          >
            <MenuActionItem
              type="link"
              as="menuitem"
              label={t({
                id: "login.profile.my-visualizations",
                message: "My visualizations",
              })}
              href="/profile"
            />
            {ADFS_PROFILE_URL && (
              <MenuActionItem
                type="link"
                as="menuitem"
                label="eIAM MyAccount"
                href={ADFS_PROFILE_URL}
              />
            )}
            <MenuActionItem
              type="button"
              as="menuitem"
              label={t({
                id: "login.profile.feedback",
                message: "Feedback",
              })}
              trailingIconName="arrowRight"
              onClick={() => setFeedbackMenuOpen(true)}
            />
            <MenuActionItem
              type="button"
              as="menuitem"
              label={t({
                id: "login.sign-out",
                message: "Sign out",
              })}
              onClick={async () =>
                await signOut({ callbackUrl: "/api/auth/signout" })
              }
            />
          </Menu>
          <Feedback
            paperEl={paperEl.current}
            open={feedbackMenuOpen}
            handleClose={() => setFeedbackMenuOpen(false)}
          />
        </>
      ) : (
        <Button
          data-testid="test-sign-in"
          variant="text"
          size="sm"
          onClick={() =>
            isVercelPreviewHost(window.location.host) ||
            process.env.E2E_ENV === "true"
              ? signIn("credentials")
              : signIn("adfs")
          }
          sx={{
            whiteSpace: "nowrap",
            color: "white",

            "&:hover": {
              color: "cobalt.100",
            },
          }}
        >
          <Typography variant="h5" component="p">
            <Trans id="login.sign-in">Sign in</Trans>
          </Typography>
        </Button>
      )}
    </div>
  );
};

const Feedback = ({
  paperEl,
  open,
  handleClose,
}: {
  paperEl: HTMLDivElement | null;
  open: boolean;
  handleClose: Dispatch<SetStateAction<boolean>>;
}) => {
  const locale = useLocale();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!paperEl) {
      return;
    }

    const paperRect = paperEl.getBoundingClientRect();

    setPosition(
      paperEl
        ? {
            top: paperRect.y + 4,
            left: paperRect.left - 8,
          }
        : { top: 0, left: 0 }
    );
  }, [open, paperEl]);

  return (
    <Menu
      anchorPosition={position}
      open={open}
      onClose={handleClose}
      anchorReference="anchorPosition"
      PaperProps={{
        sx: {
          transform: `translate(calc(-100%), 100%) !important`,
        },
      }}
    >
      <MenuActionItem
        type="link"
        as="menuitem"
        label={t({
          id: "login.profile.bug-report",
          message: "Report a Bug",
        })}
        href={createMailtoLink(locale, {
          recipients: {
            to: OWNER_ORGANIZATION_EMAIL,
            bcc: SUPPORT_EMAIL,
          },
          template: bugReportTemplates,
          subject: "Visualize Bug Report",
        })}
      />
      <MenuActionItem
        type="link"
        as="menuitem"
        label={t({
          id: "login.profile.feature-request",
          message: "Request a Feature",
        })}
        href={createMailtoLink(locale, {
          recipients: {
            to: OWNER_ORGANIZATION_EMAIL,
            bcc: SUPPORT_EMAIL,
          },
          template: featureRequestTemplates,
          subject: "Visualize Feature Request",
        })}
      />
    </Menu>
  );
};
