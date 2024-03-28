import {
  ChartUnexpectedError,
  Error,
  Loading,
  LoadingDataError,
  LoadingGeoDimensionsError,
  OnlyNegativeDataHint,
  PublishSuccess,
} from "../components/hint";

const meta = {
  title: "components / Alerts",
};

export default meta;

export const LoadingIndicator = () => (
  <div style={{ height: 150 }}>
    <Loading />
  </div>
);

export const ErrorMessage = () => (
  <div style={{ height: 150 }}>
    <Error>An Error occurred!</Error>
  </div>
);

export const SuccessMessage = () => <PublishSuccess />;

const OnlyNegativeDataHintStory = () => <OnlyNegativeDataHint />;
const ChartUnexpectedErrorStory = () => <ChartUnexpectedError />;
const LoadingGeoDimensionsErrorStory = () => <LoadingGeoDimensionsError />;
const LoadingDataErrorStory = () => (
  <LoadingDataError message="The cube does not exist." />
);

export {
  ChartUnexpectedErrorStory as ChartUnexpectedError,
  LoadingDataErrorStory as LoadingDataError,
  LoadingGeoDimensionsErrorStory as LoadingGeoDimensionsError,
  OnlyNegativeDataHintStory as OnlyNegativeDataHint,
};
