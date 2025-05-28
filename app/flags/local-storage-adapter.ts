import { FLAG_PREFIX } from "@/flags/flag";
import { FlagName, FlagValue } from "@/flags/types";

type FlagNameOrString = FlagName | (string & {});

const getKey = (name: FlagNameOrString) => `${FLAG_PREFIX}${name}`;

const listFlagLocalStorage = () => {
  return Object.keys(localStorage)
    .filter((x) => x.indexOf(FLAG_PREFIX) === 0)
    .map((x) => x.replace(FLAG_PREFIX, ""));
};

/**
 * Gets a flag from localStorage, parses value from JSON
 *
 * @param  {String} flag
 */
const getItem = (flag: FlagNameOrString) => {
  const val = localStorage.getItem(getKey(flag));
  const parsed = val ? JSON.parse(val) : val;
  return parsed;
};

/**
 * Stores a flag in localStorage, stringifies the value for storage
 *
 * @param  {String} flag
 * @param  {String} value
 */
const setItem = (flag: FlagNameOrString, value: FlagValue) => {
  const str = JSON.stringify(value);
  return localStorage.setItem(getKey(flag), str);
};

/**
 * Removes a flag from localStorage
 *
 * @param  {String} flag
 */
const removeItem = (flag: FlagNameOrString) => {
  return localStorage.removeItem(getKey(flag));
};

/**
 * Returns all stored flags as an object
 */
const getAll = () => {
  const res = {} as Record<string, FlagValue>;
  listFlagLocalStorage().forEach((flag) => {
    res[flag] = getItem(flag);
  });
  return res;
};

/**
 * Clears all the flags from localstorage
 */
const clearAll = () => {
  listFlagLocalStorage().forEach((flag) => {
    removeItem(flag);
  });
};

export const localStorageAdapter = {
  getAll,
  getItem,
  setItem,
  clearAll,
  removeItem,
};
