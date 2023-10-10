import { Box } from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

import Flex from "@/components/flex";
import contentRoutes from "@/content-routes.json";
import localeConfig from "@/locales/locales.json";
import { useLocale } from "@/locales/use-locale";

const CurrentPageLink = ({
  locale,
  ...rest
}: {
  locale: string;
  passHref?: boolean;
  children: ReactNode;
}) => {
  const { pathname, query } = useRouter();

  return (
    <NextLink
      {...rest}
      href={{ pathname, query }}
      locale={locale}
      legacyBehavior
    />
  );
};

export const LanguageMenu = ({ contentId }: { contentId?: string }) => {
  const currentLocale = useLocale();

  const alternates =
    contentId && contentId in contentRoutes
      ? (
          contentRoutes as {
            [k: string]: { [k: string]: { title: string; path: string } };
          }
        )[contentId]
      : undefined;

  return (
    <Flex
      component="ul"
      sx={{
        listStyle: "none",
        p: 0,
        my: 0,
        ml: [0, "auto"],
        width: ["100%", "auto"],
        backgroundColor: ["grey.300", "transparent"],
        justifyContent: "flex-end",
      }}
    >
      {localeConfig.locales.map((locale) => {
        const alternate = alternates?.[locale];

        const linkEl = (
          <Box
            component="a"
            rel="alternate"
            hrefLang={locale}
            sx={{
              typography: "body1",
              lineHeight: "1.25rem",
              p: 1,
              textTransform: "uppercase",
              textDecoration: "none",
              color: "grey.700",
              backgroundColor:
                locale === currentLocale
                  ? ["grey.500", "grey.300"]
                  : "transparent",
              ":hover": {
                color: "primary",
              },
              ":active": {
                color: "primary.active",
              },
              ":disabled": {
                cursor: "initial",
                color: "primary.disabled",
              },
            }}
          >
            {locale}
          </Box>
        );

        return (
          <Box component="li" key={locale} sx={{ ml: 1, p: 0 }}>
            {alternate ? (
              <NextLink
                href={alternate.path}
                passHref
                locale={false}
                legacyBehavior
              >
                {linkEl}
              </NextLink>
            ) : (
              <CurrentPageLink locale={locale} passHref>
                {linkEl}
              </CurrentPageLink>
            )}
          </Box>
        );
      })}
    </Flex>
  );
};
