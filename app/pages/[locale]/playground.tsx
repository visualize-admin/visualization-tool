import { AppLayout } from "../../components/layout";
import { Button } from "rebass";
import { useAppState } from "../../domain/app-state";
import { Input } from "@rebass/forms";
import { SyntheticEvent } from "react";

export default () => {
  const [state, dispatch] = useAppState({chartId: "playground"});
  return (
    <AppLayout>
    {/* <Button onClick={dispatch({type: "NEW"})}>Create new chart</Button> */}
      {state.state !== "INITIAL" && (
        <>
          <h1>Current State</h1>
          <div>{JSON.stringify(state)}</div>
          <Input
            type="text"
            value={state.dataSet || ""}
            onChange={(e: SyntheticEvent<HTMLInputElement>) =>
              dispatch({ type: "DATASET_SELECTED", value: e.currentTarget.value })
            }
          ></Input>
          <Button
            onClick={() => dispatch({ type: "DATASET_SELECTED", value: "hello" })}
          >
            TOGGLE
          </Button>
        </>
      )}
    </AppLayout>
  );
};
