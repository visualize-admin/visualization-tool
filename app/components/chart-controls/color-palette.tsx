import * as React from "react";
import { Field } from "../field";
import { ColorScheme } from "vega";
// export const ColorPalette = ({
//   palettes
// }: {
//   palettes: Array<{ id: ColorScheme; values: Array<string> }> | any;
// }) => {
//   const {
//     isOpen,
//     selectedItem,
//     getToggleButtonProps,
//     getLabelProps,
//     getMenuProps,
//     highlightedIndex,
//     getItemProps
//   } = useSelect({ items: palettes });
//   return (
//     <div>
//       <label {...getLabelProps()}>Choose an element:</label>
//       <button {...getToggleButtonProps()}>{selectedItem || "Elements"}</button>
//       <ul {...getMenuProps()}>
//         {isOpen &&
//           palettes.map((option: any, index: any) => (
//             <li
//               style={
//                 highlightedIndex === index ? { backgroundColor: "#ffef0f" } : {}
//               }
//               key={`${option}${index}`}
//               {...getItemProps({ item: option, index })}
//             >
//               {option}
//             </li>
//           ))}
//       </ul>
//     </div>
//   );
// };

const vegaPalettes: Array<{
  label: ColorScheme;
  value: string;
}> = [
  { label: "category10", value: "category10" },
  { label: "accent", value: "accent" },
  { label: "pastel1", value: "pastel1" },
  { label: "pastel2", value: "pastel2" },
  { label: "dark2", value: "dark2" }
];
export const ColorPalette = ({
  chartId,
  label,
  path,
  type,
  value,
  disabled,
  ...props
}: {
  chartId: string;
  label: string;
  path: string;
  type?: "text" | "checkbox" | "radio" | "input" | "select";
  value?: string;
  disabled?: boolean;
}) => {
  return (
    <Field
      type="select"
      chartId={chartId}
      path={path}
      label={label}
      options={vegaPalettes}
    />
  );
};
