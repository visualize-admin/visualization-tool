import { CurrentPageLink } from "./links";
import { locales } from "../locales/locales";
import { useLocale } from "../lib/use-locale";

export const LanguageMenu = () => {
  const currentLocale = useLocale();
  return (
    <ul>
      {locales.map(locale =>
        locale === currentLocale ? null : (
          <li key={locale}>
            <CurrentPageLink locale={locale}>
              <a hrefLang={locale}>{locale}</a>
            </CurrentPageLink>
          </li>
        )
      )}
    </ul>
  );
};
