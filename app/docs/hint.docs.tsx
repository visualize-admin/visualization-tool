import { Stack } from "@mui/material";
import { markdown, ReactSpecimen } from "catalog";

import {
  ChartUnexpectedError,
  Error,
  Loading,
  LoadingDataError,
  LoadingGeoDimensionsError,
  OnlyNegativeDataHint,
  PublishSuccess,
} from "@/components/hint";

export default () => markdown`

> Hints are components used to display an information.


## Loading indicator
${(
  <ReactSpecimen>
    <div style={{ height: 150 }}>
      <Loading />
    </div>
  </ReactSpecimen>
)}

## Error message
${(
  <ReactSpecimen>
    <div style={{ height: 150 }}>
      <Error>An Error occurred!</Error>
    </div>
  </ReactSpecimen>
)}

## Success message
${(
  <ReactSpecimen>
    <PublishSuccess />
  </ReactSpecimen>
)}

## Specific errors

${(
  <ReactSpecimen>
    <Stack spacing={2}>
      <OnlyNegativeDataHint />
      <ChartUnexpectedError />
      <LoadingGeoDimensionsError />
      <LoadingDataError message="The cube does not exist." />
    </Stack>
  </ReactSpecimen>
)}

## How to use


Hints are variants of the \`Box\` components. As a convenience, they are also available as components with semantic names.

~~~
import { Box } from "@mui/material"

<Box variant="error">
  An error occurred!
</Box>
~~~
is equivalent to
~~~
import { Error } from "./components/hint"

<Error>
  An error occurred!
</Error>
~~~

`;
