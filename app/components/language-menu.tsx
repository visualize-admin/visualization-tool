import { CurrentPageLink } from "./links";
import { useLocale } from "../lib/use-locale";
import { Link, Box, Flex } from "@theme-ui/components";

const localesOrder = ["de", "fr", "it", "en"];

export const LanguageMenu = () => {
  const currentLocale = useLocale();
  return (
    <Flex variant="header.languageList" as="ul">
      {localesOrder.map(locale => (
        <Box as="li" key={locale} variant="header.languageListItem">
          <CurrentPageLink locale={locale} passHref>
            <Link
              hrefLang={locale}
              variant={
                locale === currentLocale
                  ? "variants.header.languageLink.active"
                  : "variants.header.languageLink.normal"
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
