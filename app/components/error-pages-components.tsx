import { Link, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

import Flex from "@/components/flex";
import { Locale } from "@/locales/locales";

const useStyles = makeStyles((theme: Theme) => ({
  errorPageHint: {
    width: "100%",
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    textAlign: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
}));

export const ErrorPageHint = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();
  return <Flex className={classes.errorPageHint}>{children}</Flex>;
};

export const Actions = ({ children }: { children: ReactNode }) => (
  <Flex
    sx={{
      mb: 6,
      fontSize: ["1rem", "1.125rem", "1.125rem"],
      display: "inline",
    }}
  >
    {children}
  </Flex>
);

export const HomeLink = ({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) => (
  <NextLink href="/" locale={locale} passHref legacyBehavior>
    <Link
      sx={{
        backgroundColor: "transparent",
        color: "primary",
        textDecoration: "underline",
        cursor: "pointer",
      }}
    >
      {children}
    </Link>
  </NextLink>
);

export const ReloadButton = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  return (
    <Typography
      onClick={() => router.reload()}
      sx={{
        backgroundColor: "transparent",
        color: "primary",
        textDecoration: "underline",
        cursor: "pointer",
      }}
    >
      {children}
    </Typography>
  );
};
