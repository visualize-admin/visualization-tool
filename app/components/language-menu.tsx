import { CurrentPageLink } from "./links";
import { useLocale } from "../lib/use-locale";
import { Link, Box, Flex } from "@theme-ui/components";

const localesOrder = ["de", "fr", "it", "en"];

export const LanguageMenu = () => {
  const currentLocale = useLocale();
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
        justifyContent: "flex-end"
      }}
    >
      {localesOrder.map(locale => (
        <Box as="li" key={locale} sx={{ ml: 1, p: 0 }}>
          <CurrentPageLink locale={locale} passHref>
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
                    : "transparent"
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
