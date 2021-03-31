import NextLink from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { ReactNode } from "react";
import { Flex, Link, Text } from "theme-ui";
import { Locale } from "../locales/locales";

export const ErrorPageHint = ({ children }: { children: ReactNode }) => (
  <Flex
    sx={{
      width: "100%",
      color: "hint",
      my: 4,
      textAlign: "center",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1,
    }}
  >
    {children}
  </Flex>
);

export const Actions = ({ children }: { children: ReactNode }) => (
  <Flex sx={{ mb: 6, fontSize: [4, 5, 5], display: "inline" }}>{children}</Flex>
);

export const HomeLink = ({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) => (
  <NextLink href={`/`} locale={locale} passHref>
    <Link
      sx={{
        bg: "transparent",
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
    <Text
      onClick={() => router.reload()}
      sx={{
        bg: "transparent",
        color: "primary",
        textDecoration: "underline",
        cursor: "pointer",
      }}
    >
      {children}
    </Text>
  );
};
