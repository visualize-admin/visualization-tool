import mitt, { Emitter } from "mitt";

import localStorageAdapter from "./local-storage-adapter";
import { FLAG_NAMES, FlagName, FlagValue } from "./types";

type Events = {
  change: string;
};

/**
 * In memory key value storage.
 *
 * Can potentially be backed by localStorage if present.

 * Emits `change` when a key is set (eventEmitter).
 */
class FlagStore {
  longTermStore: typeof localStorageAdapter | null;
  store: Record<string, any>;
  ee: Emitter<Events>;

  constructor() {
    this.store = {};
    this.longTermStore = null;
    this.ee = mitt();

    if (typeof localStorage !== "undefined") {
      this.longTermStore = localStorageAdapter;
    }

    this.restore();
  }

  restore() {
    const longTermStore = this.longTermStore;

    if (!longTermStore) {
      return;
    }

    const allValues = longTermStore.getAll();

    Object.entries(allValues).forEach(([flag, val]) => {
      if (FLAG_NAMES.includes(flag as FlagName)) {
        this.store[flag] = val;
        this.ee.emit("change", flag);
      } else {
        longTermStore.removeItem(flag);
      }
    });
  }

  keys() {
    return Object.keys(this.store);
  }

  get(name: string): FlagValue {
    if (!Object.prototype.hasOwnProperty.call(this.store, name)) {
      this.store[name] = null;
    }

    return this.store[name];
  }

  set(name: FlagName, value: FlagValue) {
    if (this.longTermStore) {
      this.longTermStore.setItem(name, value);
    }

    this.store[name] = value;
    this.ee.emit("change", name);
  }

  remove(name: FlagName) {
    delete this.store[name];

    if (this.longTermStore) {
      this.longTermStore.removeItem(name);
    }

    this.ee.emit("change", name);
  }

  removeListener(_event: string, _fn: (changed: string) => void) {}
}

export default FlagStore;
