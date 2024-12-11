import { bugReportTemplates } from "./bug-report";

type EmailRecipients = {
  to: string;
  bcc: string;
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
  return `mailto:${options.recipients.to}?bcc=${
    options.recipients.bcc
  }&subject=${encodeURIComponent(options.subject)}&body=${encodeURIComponent(
    template
  )}`;
};
