import * as React from "react";
import * as vega from "vega";
import { Select as RebassSelect } from "@rebass/forms";
import { Box } from "rebass";

// export const ColorPalette = ({
//   palettes
// }: {
//   palettes: Array<{ id: vega.ColorScheme; values: Array<string> }> | any;
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
export const ColorPalette = ({
  palettes
}: {
  palettes: Array<{ id: vega.ColorScheme; values: Array<string> }> | any;
}) => {
  return <div></div>;
};
