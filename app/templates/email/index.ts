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
    subject: string;
  }
) => {
  const template = options.template[lang];
  return `mailto:${options.recipients.to}?cc=${
    options.recipients.cc
  }&subject=${encodeURIComponent(options.subject)}&body=${encodeURIComponent(
    template
  )}`;
};
