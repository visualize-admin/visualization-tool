export const interlace = <T extends unknown, I extends unknown>(
  arr: T[],
  interlacer: I
) => {
  const res = new Array(Math.max(arr.length * 2 - 1, 0));
  for (let i = 0; i < arr.length; i++) {
    res[i * 2] = arr[i];
    if (i < arr.length - 1) {
      res[i * 2 + 1] = interlacer;
    }
  }
  return res;
};
