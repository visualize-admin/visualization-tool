/**
 * Entry point for app package
 */

export { I18nProvider } from "@lingui/react";
export {
  Configurator,
  ConfiguratorStateProvider,
  useConfiguratorState,
} from "./configurator";
export { LocaleProvider, useLocale } from "./locales/use-locale";
export {
  i18n,
  defaultLocale,
  locales,
  parseLocaleString,
} from "./locales/locales";
