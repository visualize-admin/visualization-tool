import get from "lodash/get";
import { InputHTMLAttributes } from "react";
import { useAppState } from "./app-state";

// interface FieldProps {
//   name: HTMLInputElement["name"]
//   onChange: [];
// }

type FieldProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "name" | "value"
>;

export const useField = ({
  chartId,
  path
}: {
  chartId: string;
  path: string;
}): FieldProps => {
  const [state, dispatch] = useAppState({ chartId });

  return {
    name: path,
    value: state.state === "IN_PROGRESS" ? get(state, path, "") : "",
    onChange: e =>
      dispatch({
        type: "CHART_CONFIG_CHANGED",
        value: { path, value: e.currentTarget.value }
      })
  };
};
