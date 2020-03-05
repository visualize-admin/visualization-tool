/**
 * Entry point for app package
 */

export {
  useConfiguratorState,
  ConfiguratorStateProvider
} from "./domain/configurator-state";

export { ChartEditor } from "./components/editor/chart-editor";

export { useLocale, LocaleProvider } from "./lib/use-locale";

export { I18nProvider } from "@lingui/react";

export {
  catalogs,
  defaultLocale,
  locales,
  parseLocaleString
} from "./locales/locales";
