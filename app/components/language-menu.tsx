import { CurrentPageLink } from "./links";
import { locales } from "../locales/locales";
import { useLocale } from "../lib/use-locale";
import { Link, Box, Flex } from "rebass";

export const LanguageMenu = () => {
  const currentLocale = useLocale();
  return (
    <Flex as="ul" sx={{ listStyle: "none" }} p={0} m={0}>
      {locales.map(locale =>
        locale === currentLocale ? null : (
          <Box as="li" key={locale} p={0} marginRight={0}>
            <CurrentPageLink locale={locale} passHref>
              <Link variant="nav" hrefLang={locale}>
                {locale}
              </Link>
            </CurrentPageLink>
          </Box>
        )
      )}
    </Flex>
  );
};
