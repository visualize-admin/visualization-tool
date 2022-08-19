export const getLocalStorageItem = (key: string) => {
  return typeof window !== "undefined" ? localStorage.getItem(key) : null;
};
