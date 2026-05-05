import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ORG_KEY = "current-organization-id";

interface OrganizationState {
  currentOrganizationId: string | null;
  setOrganizationId: (id: string | null) => void;
  hydrate: () => Promise<void>;
}

export const useOrganizationStore = create<OrganizationState>()((set) => ({
  currentOrganizationId: null,

  setOrganizationId: (id) => {
    if (id) {
      AsyncStorage.setItem(ORG_KEY, id);
    } else {
      AsyncStorage.removeItem(ORG_KEY);
    }
    set({ currentOrganizationId: id });
  },

  hydrate: async () => {
    const id = await AsyncStorage.getItem(ORG_KEY);
    set({ currentOrganizationId: id });
  },
}));
