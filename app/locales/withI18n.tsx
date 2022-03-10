import { I18nProvider } from "@lingui/react";
import { i18n } from "./locales";

interface Props {}

const withI18n =
  <T extends Props>(Component: React.ComponentType<T>) =>
  (props: T) => {
    return (
      <I18nProvider i18n={i18n}>
        <Component {...props} />
      </I18nProvider>
    );
  };

export default withI18n;
