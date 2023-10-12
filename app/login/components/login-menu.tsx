import { Box, Button, Link, Typography } from "@mui/material";
import { signIn } from "next-auth/react";
import NextLink from "next/link";

import { useUser } from "@/login/utils";

export const LoginMenu = () => {
  const user = useUser();

  return (
    <Box sx={{ alignItems: "center", display: "flex" }}>
      {user ? (
        <Typography variant="body2">
          <NextLink href="/profile" passHref legacyBehavior>
            <Link sx={{ textDecoration: "none", color: "primary.main" }}>
              {user.name}
            </Link>
          </NextLink>
        </Typography>
      ) : (
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={() => signIn("keycloak")}
        >
          Sign in
        </Button>
      )}
    </Box>
  );
};
