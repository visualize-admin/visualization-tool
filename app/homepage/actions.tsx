import { ContentWrapper } from "@interactivethings/swiss-federal-ci/dist/components";

type ActionElementProps = {
  headline: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
};

export const Actions = ({
  contribute,
  newsletter,
  bugReport,
  featureRequest,
}: {
  contribute: ActionElementProps;
  newsletter: ActionElementProps;
  bugReport: ActionElementProps;
  featureRequest: ActionElementProps;
}) => {
  return (
    <>
      <ContentWrapper sx={{ py: 15 }}></ContentWrapper>
      <ContentWrapper sx={{ py: 15 }}></ContentWrapper>
    </>
  );
};
