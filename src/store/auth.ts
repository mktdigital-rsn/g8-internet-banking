import { atomWithStorage, createJSONStorage } from "jotai/utils";

const memoryStorage: Storage = {
  length: 0,
  clear: () => undefined,
  getItem: () => null,
  key: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
};

const getStorage = () => {
  if (typeof window === "undefined") {
    return memoryStorage;
  }

  return window.localStorage;
};

const temporaryDeviceIdStorage = createJSONStorage<string>(getStorage);

export const temporaryDeviceIdAtom = atomWithStorage(
  "temporaryDeviceId",
  "",
  temporaryDeviceIdStorage,
  { getOnInit: true }
);
