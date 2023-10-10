/**
 * Entry point for app package
 */

export { I18nProvider } from "@lingui/react";
export {
  Configurator,
  ConfiguratorStateProvider,
  useConfiguratorState,
} from "../configurator";
export {
  defaultLocale,
  i18n,
  locales,
  parseLocaleString,
} from "../locales/locales";
export { LocaleProvider, useLocale } from "../locales/use-locale";
export { DatasetBrowser } from "../pages/browse";
