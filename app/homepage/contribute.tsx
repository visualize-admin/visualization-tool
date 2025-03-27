import { ContentWrapper } from "@interactivethings/swiss-federal-ci/dist/components";
import { Button, Typography } from "@mui/material";

import Flex from "@/components/flex";

export const Contribute = ({
  headline,
  description,
  buttonLabel,
  buttonUrl,
}: {
  headline: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
}) => {
  return (
    <ContentWrapper>
      <Flex>
        <Typography>{headline}</Typography>
        <Typography>{description}</Typography>
      </Flex>
      <Flex>
        <Button href={buttonUrl} target="_blank" rel="noopener noreferrer">
          {buttonLabel}
        </Button>
      </Flex>
    </ContentWrapper>
  );
};
