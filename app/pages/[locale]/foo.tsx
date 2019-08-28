import { useLocale } from "../../lib/use-locale";
import { useRouter } from "next/router";
import { LanguageMenu } from "../../components/language-menu";

export default () => {
  const locale = useLocale();

  return (
    <div>
      <LanguageMenu />
      Locale is: {locale}
    </div>
  );
};
