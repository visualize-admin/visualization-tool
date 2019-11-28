import { CurrentPageLink } from "./links";
import { locales } from "../locales/locales";
import { useLocale } from "../lib/use-locale";
import { Link, Box, Flex } from "rebass";

export const LanguageMenu = () => {
  const currentLocale = useLocale();
  return (
    <Flex variant="header.languageList" as="ul">
      {locales.map(locale => (
        <Box as="li" key={locale} variant="header.languageListItem">
          <CurrentPageLink locale={locale} passHref>
            <Link
              hrefLang={locale}
              variant={
                locale === currentLocale
                  ? "header.languageLink.active"
                  : "header.languageLink.normal"
              }
            >
              {locale}
            </Link>
          </CurrentPageLink>
        </Box>
      ))}
    </Flex>
  );
};
