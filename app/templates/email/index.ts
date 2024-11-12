import { bugReportTemplates } from "./bug-report";

type EmailRecipients = {
  to: string;
  cc: string;
};

export const createMailtoLink = (
  lang: keyof typeof bugReportTemplates,
  options: {
    recipients: EmailRecipients;
    template: typeof bugReportTemplates;
  }
) => {
  const template = options.template[lang];
  return `mailto:${options.recipients.to}?cc=${
    options.recipients.cc
  }&subject=${encodeURIComponent("Bug Report")}&body=${encodeURIComponent(
    template
  )}`;
};
