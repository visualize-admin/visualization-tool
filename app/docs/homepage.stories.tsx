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
import { Section } from "@/homepage/section";

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
            description="Stay up to day and subscribe to our newsletter by adding your email address below."
            buttonLabel="Subscribe"
            buttonUrl="mailto:visualize@bafu.admin.ch"
          />
        </Section>
        <BugReport
          headline="Found a bug?"
          description="Please report the bug, so can fix it as soon as possible"
          buttonLabel="Report a bug"
          buttonUrl="mailto:visualize@bafu.admin.ch"
        />
      </Box>
    </ReactSpecimen>
  ),
};

export { HomepageStory as Homepage };
