import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
};

type SubscriptionInfo = {
  planName: string;
  planDisplayName: string;
  hasAdvancedReports: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
  hasPriorityProcessing: boolean;
  hasWhiteLabel: boolean;
  hasMarketplaceAccess: boolean;
  hasDataVault: boolean;
  hasDistribution: boolean;
  hasCertification: boolean;
  hasEnterpriseAudit: boolean;
  courtReadyDocuments: boolean;
  complianceInsurance: boolean;
  maxProjects: number;
  maxUrlsPerProject: number;
  maxScansPerMonth: number;
  aiCreditsBalance: number;
};

type AuthStore = {
  authToken: string | null;
  user: User | null;
  subscription: SubscriptionInfo | null;
  setAuth: (authToken: string, user: User) => void;
  setSubscription: (subscription: SubscriptionInfo) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      authToken: null,
      user: null,
      subscription: null,
      setAuth: (authToken, user) => set({ authToken, user }),
      setSubscription: (subscription) => set({ subscription }),
      clearAuth: () => set({ authToken: null, user: null, subscription: null }),
    }),
    {
      name: "lucy-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
