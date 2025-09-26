export const maybeWindow = () => {
  return typeof window !== "undefined" ? window : undefined;
};
