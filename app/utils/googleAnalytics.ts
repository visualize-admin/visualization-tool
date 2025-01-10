import { GA_TRACKING_ID } from "../domain/env";

declare global {
  interface Window {
    gtag?: (...args: $IntentionalAny) => void;
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/ip-anonymization

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const analyticsPageView = (path: string) => {
  window.gtag?.("config", GA_TRACKING_ID, {
    page_path: path,
    anonymize_ip: true,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
/** @internal */
export const analyticsEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  window.gtag?.("event", action, {
    event_category: category,
    event_label: label,
    value: value,
    anonymize_ip: true,
  });
};
