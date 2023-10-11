import { Box, Button, Typography } from "@mui/material";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { useUser } from "@/login/utils";

export const LoginMenu = () => {
  const user = useUser();

  return (
    <Box sx={{ alignItems: "center", display: "flex" }}>
      {user ? (
        <Typography variant="body2">
          <Link href="/profile" legacyBehavior>
            {user.name}
          </Link>
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
