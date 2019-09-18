import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { SyntheticEvent } from "react";
import { LocalizedLink } from "../../../components/links";
import { AppLayout } from "../../../components/layout";
import { useAppState } from "../../../domain/app-state";
import { Input } from "@rebass/forms";
import { Button, Box } from "rebass";

const useChartId = () => {
  const { query } = useRouter();

  const chartId = query.chartId as string; // Safe type cast because in the context of this page, chartId is always a string

  return chartId;
};

const Page: NextPage = () => {
  const chartId = useChartId();
  const [state, dispatch] = useAppState({ chartId });

  return (
    <AppLayout>
      <div>
        
        <LocalizedLink href={"/[locale]/chart/new"} passHref>
          <a>New chart!</a>
        </LocalizedLink>

        <Box my={3} p={2}>
          {state.state !== "UNINITIALIZED" && (
            <>
              Input something:
              <Input
                type="text"
                value={state.selectedDataSet || ""}
                onChange={(e: SyntheticEvent<HTMLInputElement>) =>
                  dispatch({
                    type: "SELECT_DATASET",
                    value: e.currentTarget.value
                  })
                }
              ></Input>
              {/* <Button
                onClick={() =>
                  dispatch({ type: "SELECT_DATASET", value: "hello" })
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
      </div>
    </AppLayout>
  );
};

export default Page;
