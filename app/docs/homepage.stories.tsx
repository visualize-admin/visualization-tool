import { Box } from "@mui/material";
import { Meta } from "@storybook/react";

import {
  BugReport,
  Contribute,
  Examples,
  Intro,
  Newsletter,
  Tutorial,
} from "@/homepage";
import { FeatureRequest } from "@/homepage/feature-request";
import { Section } from "@/homepage/section";
import { bugReportTemplates } from "@/templates/email/bug-report";
import { OWNER_ORGANIZATION_EMAIL } from "@/templates/email/config";
import { featureRequestTemplates } from "@/templates/email/feature-request";

import { createMailtoLink } from "../../app/templates/email";

import { ReactSpecimen } from "./catalog";

const meta: Meta = {
  title: "page / Homepage",
};

export default meta;

const HomepageStory = {
  render: () => (
    <ReactSpecimen>
      <Box>
        <Intro
          title="Visualize Swiss Open Government Data"
          teaser="Create and embed visualizations from any dataset provided by the LINDAS Linked Data Service."
          buttonLabel="Create a visualization"
        />
        <Tutorial
          headline="Visualize data in just a few steps…"
          step1="Select a dataset"
          step2="Edit the visualization"
          step3="Share & embed"
        />
        <Examples
          headline="Make it your own…"
          example1Headline="Create beautiful visualizations"
          example1Description="Choose from a wide range of chart types and configure them according to your needs."
          example2Headline="Use powerful customizations"
          example2Description="With the help of custom filters and data segmentation, even complex issues can be visualized."
        />
        <Section>
          <Contribute
            headline="Would you like to visualize your own data?"
            description="Find out how you can integrate your data into the LINDAS Linked Data Service."
            buttonLabel="Learn how"
            buttonUrl="https://lindas.admin.ch/?lang=en"
          />
          <div style={{ width: "1px", backgroundColor: "#e5e5e5" }}></div>
          <Newsletter
            headline="Subscribe to our Newsletter"
            description="Stay up to date and subscribe to our newsletter by adding your email address below."
            buttonLabel="Subscribe"
            buttonUrl={`mailto:${OWNER_ORGANIZATION_EMAIL}`}
          />
        </Section>

        <Section
          sx={{
            color: "grey.800",
          }}
        >
          <BugReport
            headline="Found a bug?"
            description="Please report the bug, so can fix it as soon as possible."
            buttonLabel="Report a bug"
            buttonUrl={createMailtoLink("en", {
              recipients: {
                to: "visualize@bafu.admin.ch",
                cc: "supprt@interactivethings.com",
              },
              template: bugReportTemplates,
              subject: "Visualize Bug Report",
            })}
          />
          <div style={{ width: "1px", backgroundColor: "#cccccc" }}></div>
          <FeatureRequest
            headline="New feature request"
            description="Submit your feature requests today and help shape the future of our platform!"
            buttonLabel="Submit"
            buttonUrl={createMailtoLink("en", {
              recipients: {
                to: "visualize@bafu.admin.ch",
                cc: "supprt@interactivethings.com",
              },
              template: featureRequestTemplates,
              subject: "Visualize Feature Request",
            })}
          />
        </Section>
      </Box>
    </ReactSpecimen>
  ),
};

export { HomepageStory as Homepage };
