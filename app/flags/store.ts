import mitt, { Emitter } from "mitt";

import lsAdapter from "./ls-adapter";

export type FlagValue = any;
export type FlagName = string;

type Events = { change: string };
/**
 * In memory key value storage.
 *
 * Can potentially be backed by localStorage if present

 * Emits `change` when a key is set (eventEmitter)
 */
class FlagStore {
  longtermStore: typeof lsAdapter | null;

  store: Record<string, any>;
  ee: Emitter<Events>;

  constructor() {
    this.store = {};
    this.longtermStore = null;
    this.ee = mitt();
    if (typeof localStorage !== "undefined") {
      this.longtermStore = lsAdapter;
    }
    this.restore();
  }

  restore() {
    if (!this.longtermStore) {
      return;
    }
    const allValues = this.longtermStore.getAll();
    Object.entries(allValues).forEach(([flag, val]) => {
      this.store[flag] = val;
      this.ee.emit("change", flag);
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

  set(name: string, value: FlagValue) {
    if (this.longtermStore) {
      this.longtermStore.setItem(name, value);
    }
    this.store[name] = value;
    this.ee.emit("change", name);
  }

  remove(name: string) {
    delete this.store[name];
    if (this.longtermStore) {
      this.longtermStore.removeItem(name);
    }
    this.ee.emit("change", name);
  }

  // eslint-disable-next-line class-methods-use-this
  removeListener(_event: string, _fn: (changed: string) => void) {}
}

export default FlagStore;
