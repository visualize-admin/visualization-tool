/**
 * Entry point for app package
 */

export { I18nProvider } from "@lingui/react";
export {
  Configurator,
  ConfiguratorStateProvider,
  useConfiguratorState,
} from "./configurator";
export { LocaleProvider, useLocale } from "./lib/use-locale";
export {
  catalogs,
  defaultLocale,
  locales,
  parseLocaleString,
} from "./locales/locales";
