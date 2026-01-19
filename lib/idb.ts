import { StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";
export const idb: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === "undefined") return null;
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window !== "undefined") {
      await set(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window !== "undefined") {
      await del(name);
    }
  },
};
