import { CurrentPageLink } from "./links";
import { useLocale } from "../locales/use-locale";
import { Link, Box, Flex } from "theme-ui";
import NextLink from "next/link";
import contentRoutes from "../content-routes.json";
import { locales } from "../locales/locales.json";

export const LanguageMenu = ({ contentId }: { contentId?: string }) => {
  const currentLocale = useLocale();

  const alternates =
    contentId && contentId in contentRoutes
      ? (contentRoutes as {
          [k: string]: { [k: string]: { title: string; path: string } };
        })[contentId]
      : undefined;

  return (
    <Flex
      as="ul"
      sx={{
        listStyle: "none",
        p: [2, 0],
        ml: [0, "auto"],
        width: ["100%", "auto"],
        bg: ["monochrome300", "transparent"],
        order: [1, 2],
        justifyContent: "flex-end",
      }}
    >
      {locales.map((locale) => {
        const alternate = alternates?.[locale];

        const linkEl = (
          <Link
            rel="alternate"
            hrefLang={locale}
            sx={{
              variant: "text.paragraph2",
              fontSize: 3,
              lineHeight: 3,
              p: 1,
              textTransform: "uppercase",
              textDecoration: "none",
              color: "monochrome700",
              bg:
                locale === currentLocale
                  ? ["monochrome500", "monochrome300"]
                  : "transparent",
              ":hover": {
                color: "primary",
              },
              ":active": {
                color: "primaryActive",
              },
              ":disabled": {
                cursor: "initial",
                color: "primaryDisabled",
              },
            }}
          >
            {locale}
          </Link>
        );

        return (
          <Box as="li" key={locale} sx={{ ml: 1, p: 0 }}>
            {alternate ? (
              <NextLink href={alternate.path} passHref>
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
