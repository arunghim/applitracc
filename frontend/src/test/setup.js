import "@testing-library/jest-dom";

// Provide a working localStorage shim for jsdom environments that don't expose it.
const localStorageShim = (() => {
  let store = {};
  return {
    getItem: (k) =>
      Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null,
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
    key: (i) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageShim,
  writable: true,
});
