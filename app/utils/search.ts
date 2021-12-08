export const wrap = (
  value: string,
  indices: readonly [number, number][],
  options: { tagOpen: string; tagClose: string }
) => {
  let result = "";
  let curIndex = -1;
  for (const [start, end] of indices) {
    if (start !== curIndex) {
      result = result + `${value.substring(curIndex, start)}`;
    }
    result =
      result +
      `${options.tagOpen}${value.substring(start, end + 1)}${options.tagClose}`;
    curIndex = end + 1;
  }
  if (curIndex !== value.length - 1) {
    result += `${value.substring(curIndex)}`;
  }
  return result;
};
