import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { SyntheticEvent } from "react";
import { LocalizedLink } from "../../../components/links";
import { AppLayout } from "../../../components/layout";
import { useAppState, AppStateProvider } from "../../../domain/app-state";
import { Input } from "@rebass/forms";
import { Button, Box } from "rebass";
import { useField } from "../../../domain/config-form";

const useChartId = () => {
  const { query } = useRouter();

  const chartId = query.chartId as string; // Safe type cast because in the context of this page, chartId is always a string

  return chartId;
};

const Form = ({ chartId }: { chartId: string }) => {
  const [state, dispatch] = useAppState({ chartId });

  const field0 = useField({
    chartId,
    path: "dataSet"
  });
  const field1 = useField({
    chartId,
    path: "chartConfig.foo"
  });

  return (
    <>
      <Box my={3} p={2}>
        {state.state !== "INITIAL" && (
          <>
            Input something:
            <Input type="text" {...field0}></Input>
            <Input type="text" {...field1}></Input>
            {/* <Button
                onClick={() =>
                  dispatch({ type: "DATASET_SELECTED", value: "hello" })
                }
              >
                TOGGLE
              </Button> */}
          </>
        )}
      </Box>
      <Box my={3} p={2} bg="muted">
        <pre>{chartId}</pre>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </Box>
    </>
  );
};

const Page: NextPage = () => {
  const chartId = useChartId();

  return (
    <AppLayout>
      <AppStateProvider key={chartId}>
        <div>
          <LocalizedLink href={"/[locale]/chart/new"} passHref>
            <a>New chart!</a>
          </LocalizedLink>
          <Form chartId={chartId} />
        </div>
      </AppStateProvider>
    </AppLayout>
  );
};

export default Page;
