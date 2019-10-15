import { CurrentPageLink } from "./links";
import { locales } from "../locales/locales";
import { useLocale } from "../lib/use-locale";
import { Link, Box, Flex } from "rebass";

export const LanguageMenu = () => {
  const currentLocale = useLocale();
  return (
    <Flex
      variant="header.languageMenu"
      as="ul"
      sx={{ listStyle: "none" }}
      p={0}
      m={0}
    >
      {locales.map(locale => (
        <Box as="li" key={locale} p={0} marginRight={0}>
          <CurrentPageLink locale={locale} passHref>
            <Link
              hrefLang={locale}
              variant="header.languageLink"
              sx={{
                bg:
                  locale === currentLocale ? "monochrome.300" : "monochrome.100"
              }}
            >
              {locale}
            </Link>
          </CurrentPageLink>
        </Box>
      ))}
    </Flex>
  );
};
