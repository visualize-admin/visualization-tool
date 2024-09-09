import { t, Trans } from "@lingui/macro";
import { Button, Typography } from "@mui/material";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";

import { ArrowMenuTopCenter } from "@/components/arrow-menu";
import { MenuActionItem } from "@/components/menu-action-item";
import { ADFS_PROFILE_URL } from "@/domain/env";
import { useUser } from "@/login/utils";

export const LoginMenu = () => {
  const user = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
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
              "&:hover": {
                backgroundColor: "transparent !important",
              },
            }}
          >
            <Typography variant="body2">{user.name}</Typography>
          </Button>
          <ArrowMenuTopCenter
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
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
                id: "login.sign-out",
                message: "Sign out",
              })}
              onClick={async () =>
                await signOut({ callbackUrl: "/api/auth/signout" })
              }
            />
          </ArrowMenuTopCenter>
        </>
      ) : (
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={() => signIn("adfs")}
        >
          <Trans id="login.sign-in">Sign in</Trans>
        </Button>
      )}
    </div>
  );
};
