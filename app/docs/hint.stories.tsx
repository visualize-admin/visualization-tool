import { Stack } from "@mui/material";

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

export const SpecificErrors = () => (
  <Stack spacing={2}>
    <OnlyNegativeDataHint />
    <ChartUnexpectedError />
    <LoadingGeoDimensionsError />
    <LoadingDataError message="The cube does not exist." />
  </Stack>
);
