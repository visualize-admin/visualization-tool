/**
 * Entry point for app package
 */

import { Configurator as ConfiguratorRaw } from "../configurator";
export {
  ConfiguratorStateProvider,
  useConfiguratorState,
} from "../configurator";
import { DatasetBrowser as DatasetBrowserRaw } from "../browser";
export { LocaleProvider, useLocale } from "../locales/use-locale";
export { defaultLocale, locales, parseLocaleString } from "../locales/locales";
import { withI18n } from "../locales/locales";
import { withTheme } from "../themes";
import { flowRight } from "lodash";

const enhance = flowRight(withI18n, withTheme);

export const DatasetBrowser = enhance(DatasetBrowserRaw);
export const Configurator = enhance(ConfiguratorRaw);
