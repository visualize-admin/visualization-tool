import { bugReportTemplates } from "./bug-report";

type EmailRecipients = {
  to: string;
  bcc?: string;
};

export const createMailtoLink = (
  lang: keyof typeof bugReportTemplates,
  {
    recipients,
    template: _template,
    subject,
  }: {
    recipients: EmailRecipients;
    template: typeof bugReportTemplates;
    subject: string;
  }
) => {
  const template = _template[lang];

  return `mailto:${recipients.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    template
  )}${recipients.bcc ? `&bcc=${recipients.bcc}` : ""}`;
};
