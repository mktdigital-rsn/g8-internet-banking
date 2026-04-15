import { atomWithStorage, createJSONStorage } from "jotai/utils";

const temporaryDeviceIdStorage = createJSONStorage<string>(() => localStorage);

export const temporaryDeviceIdAtom = atomWithStorage(
  "temporaryDeviceId",
  "",
  temporaryDeviceIdStorage,
  { getOnInit: true }
);
