import * as React from "react";
import type {
  Appointment,
  AuthState,
  ChatMessage,
  HealthProfile,
  Notification,
  Settings,
  StoredRisk,
  VitalsLog,
} from "./types";
import { demoAppointments, demoChat, demoNotifications, demoProfile, demoVitals } from "./demoData";

interface AppState {
  auth: AuthState;
  profile: HealthProfile;
  vitals: VitalsLog[];
  appointments: Appointment[];
  notifications: Notification[];
  chat: ChatMessage[];
  settings: Settings;
  risks: StoredRisk;
}

const defaultState: AppState = {
  auth: { signedIn: false, guest: false, name: "", email: "" },
  profile: demoProfile,
  vitals: demoVitals,
  appointments: demoAppointments,
  notifications: demoNotifications,
  chat: demoChat,
  settings: {
    units: "metric",
    notifications: { reminders: true, hydration: true, appointments: true, weekly: true },
    theme: "light",
  },
  risks: {},
};

const KEY = "jeeva-state-v1";

interface Ctx extends AppState {
  update: (patch: Partial<AppState>) => void;
  reset: () => void;
}

const AppContext = React.createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppState>(defaultState);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        setState((s) => ({ ...s, ...parsed, settings: { ...s.settings, ...parsed.settings } }));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
    document.documentElement.classList.toggle("dark", state.settings.theme === "dark");
  }, [state, hydrated]);

  const update = React.useCallback((patch: Partial<AppState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const reset = React.useCallback(() => {
    setState(defaultState);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = React.useMemo(() => ({ ...state, update, reset }), [state, update, reset]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
