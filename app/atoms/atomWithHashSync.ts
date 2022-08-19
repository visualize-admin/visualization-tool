/**
 * Jotai's atomWithHashSync is initialized asynchronously. It causes problems when
 * there is logic that is executed at mount time to check empty state and
 * filling it with default values: since at mount time the default value of
 * the atom is used, the "filling" logic believes the default state should
 * be filled, and overwrites the value that is stored in the URL hash.
 *
 * To prevent the problem, we use a modified version of atomWithHashSync that has
 * the delayInit parameter set to false. This makes the initialisation synchronous;
 * when the atom is mounted, it will synchronously fetch its state from the URL
 * hash. This way, the "filling" logic behavior can work correctly.
 *
 * @see https://github.com/pmndrs/jotai/issues/739 for an issue on the potentiality of letting
 * atomWithHashSync be optionally created with delayInit=false
 */

import { PrimitiveAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Exporting serialisation methods for use then building links
export const defaultSerialize = JSON.stringify;
export const defaultDeserialize = JSON.parse;

type Unsubscribe = () => void;

type Storage<Value> = {
  getItem: (key: string) => Value | Promise<Value>;
  setItem: (key: string, newValue: Value) => void | Promise<void>;
  delayInit?: boolean;
  subscribe?: (key: string, callback: (value: Value) => void) => Unsubscribe;
};

function atomWithHashSync<Value>(
  key: string,
  initialValue: Value,
  serialize: (val: Value) => string = defaultSerialize,
  deserialize: (str: string) => Value = defaultDeserialize
): PrimitiveAtom<Value> {
  const hashStorage: Storage<Value> = {
    getItem: (key) => {
      const searchParams = new URLSearchParams(location.hash.slice(1));
      const storedValue = searchParams.get(key);
      if (storedValue === null) {
        throw new Error("no value stored");
      }
      return deserialize(storedValue);
    },
    setItem: (key, newValue) => {
      const searchParams = new URLSearchParams(location.hash.slice(1));
      searchParams.set(key, serialize(newValue));
      location.hash = searchParams.toString();
    },
    delayInit: false, // Change from default jotai's atomWithHashSync
    subscribe: (key, setValue) => {
      const callback = () => {
        const searchParams = new URLSearchParams(location.hash.slice(1));
        const str = searchParams.get(key);
        if (str !== null) {
          setValue(deserialize(str));
        }
      };
      window.addEventListener("hashchange", callback);
      return () => {
        window.removeEventListener("hashchange", callback);
      };
    },
  };

  return atomWithStorage(key, initialValue, hashStorage);
}

export default atomWithHashSync;
