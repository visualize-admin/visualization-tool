import get from "lodash/get";
import { InputHTMLAttributes, useCallback, ChangeEvent } from "react";
import { useAppState } from "./app-state";

// interface FieldProps {
//   name: HTMLInputElement["name"]
//   onChange: [];
// }

type FieldProps = (
  path: string
) => Pick<InputHTMLAttributes<HTMLInputElement>, "onChange" | "name" | "value">;

export const useField = ({ chartId }: { chartId: string }): FieldProps => {
  const [state, dispatch] = useAppState({ chartId });

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    e =>
      dispatch({
        type: "CHART_CONFIG_CHANGED",
        value: { path: e.currentTarget.name, value: e.currentTarget.value }
      }),
    [dispatch]
  );

  return (path: string) => ({
    name: path,
    value: state.state === "IN_PROGRESS" ? get(state, path, "") : "",
    onChange
  });
};
