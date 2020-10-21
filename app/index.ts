/**
 * Entry point for app package
 */

export {
  useConfiguratorState,
  ConfiguratorStateProvider,
} from "./configurator";

export { Configurator as ChartEditor } from "./configurator/components/configurator";

export { useLocale, LocaleProvider } from "./lib/use-locale";

export { I18nProvider } from "@lingui/react";

export {
  catalogs,
  defaultLocale,
  locales,
  parseLocaleString,
} from "./locales/locales";
