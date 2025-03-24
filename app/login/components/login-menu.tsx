import { t, Trans } from "@lingui/macro";
import { Button, Menu, Typography } from "@mui/material";
import { signIn, signOut } from "next-auth/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

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

  return (
    <div>
      {user ? (
        <>
          <Button
            variant="text"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              minWidth: 0,
              minHeight: 0,
              padding: 0,
              gap: 1,
              color: "muted.colored",
              "&:hover": {
                color: "#d1d5db", // FIXME: once the new colors are in place
                backgroundColor: "transparent !important",
              },
            }}
          >
            <Typography noWrap>{user.name}</Typography>
            <Icon name="chevronDown2" size={24} />
          </Button>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { mt: 3 } }}
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
              trailingIconName="chevronRight"
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
            anchorEl={anchorEl}
            open={feedbackMenuOpen}
            handleClose={() => setFeedbackMenuOpen(false)}
          />
        </>
      ) : (
        <Button
          data-testid="test-sign-in"
          variant="text"
          sx={{
            color: "muted.colored",
            fontSize: "16px",
            whiteSpace: "nowrap",
            ":hover": {
              color: "#d1d5db", // FIXME: once the new colors are in place
            },
          }}
          size="small"
          onClick={() =>
            isVercelPreviewHost(window.location.host) ||
            process.env.E2E_ENV === "true"
              ? signIn("credentials")
              : signIn("adfs")
          }
        >
          <Trans id="login.sign-in">Sign in</Trans>
        </Button>
      )}
    </div>
  );
};

const Feedback = ({
  open,
  handleClose,
  anchorEl,
}: {
  open: boolean;
  handleClose: Dispatch<SetStateAction<boolean>>;
  anchorEl: HTMLButtonElement | null;
}) => {
  const locale = useLocale();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setPosition(
      anchorEl
        ? {
            top:
              anchorEl.getBoundingClientRect().bottom +
              anchorEl.getBoundingClientRect().y,
            left:
              anchorEl.getBoundingClientRect().left -
              anchorEl.getBoundingClientRect().width -
              100,
          }
        : { top: 0, left: 0 }
    );
  }, [anchorEl, open]);

  return (
    <Menu
      anchorPosition={position}
      open={open}
      onClose={handleClose}
      anchorReference="anchorPosition"
      PaperProps={{ sx: { mt: 3 } }}
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
