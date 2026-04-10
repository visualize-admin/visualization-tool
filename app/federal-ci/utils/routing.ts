export const stripQueryParams = (path: string) => {
  return path.split("?")[0];
};
