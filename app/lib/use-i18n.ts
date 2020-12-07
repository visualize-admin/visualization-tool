import { useLingui } from "@lingui/react";

export const useI18n = () => {
  const { i18n } = useLingui();

  return i18n;
};
