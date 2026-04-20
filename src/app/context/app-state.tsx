import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { mockLoads, type Load } from "../data/loads";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
}

interface AppStateValue {
  allLoads: Load[];
  isAuthenticated: boolean;
  darkMode: boolean;
  savedLoadIds: string[];
  bookedLoadIds: string[];
  notifications: AppNotification[];
  searchQuery: string;
  profile: UserProfile | null;
  unreadNotifications: number;
  savedLoads: Load[];
  bookedLoads: Load[];
  login: (payload: { email: string }) => void;
  logout: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  setSearchQuery: (value: string) => void;
  toggleSavedLoad: (loadId: string) => boolean;
  bookLoad: (loadId: string) => boolean;
  updateProfile: (payload: UserProfile) => void;
  markAllNotificationsRead: () => void;
  importLoads: (loads: Load[]) => number;
}

const STORAGE_KEYS = {
  auth: "transio-auth",
  darkMode: "transio-dark-mode",
  saved: "transio-saved-loads",
  booked: "transio-booked-loads",
  profile: "transio-profile",
  notifications: "transio-notifications",
  importedLoads: "transio-imported-loads",
} as const;

const defaultNotifications: AppNotification[] = [
  {
    id: "n-1",
    title: "New hot load available",
    description: "Chicago to Dallas lane now offers a higher rate.",
    createdAt: "2 min ago",
    read: false,
  },
  {
    id: "n-2",
    title: "Saved load updated",
    description: "A saved reefer load changed its pickup time.",
    createdAt: "18 min ago",
    read: false,
  },
  {
    id: "n-3",
    title: "System ready",
    description: "TransIO platform is ready for dispatch operations.",
    createdAt: "Today",
    read: true,
  },
];

const defaultProfile: UserProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "(555) 123-4567",
  company: "TransIO Logistics",
};

const AppStateContext = createContext<AppStateValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function createNotification(
  title: string,
  description: string
): AppNotification {
  return {
    id: `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    description,
    createdAt: "Just now",
    read: false,
  };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkModeState] = useState(true);
  const [savedLoadIds, setSavedLoadIds] = useState<string[]>([]);
  const [bookedLoadIds, setBookedLoadIds] = useState<string[]>([]);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(defaultNotifications);
  const [profile, setProfile] = useState<UserProfile | null>(defaultProfile);
  const [searchQuery, setSearchQuery] = useState("");
  const [importedLoads, setImportedLoads] = useState<Load[]>([]);

  useEffect(() => {
    setIsAuthenticated(readStorage(STORAGE_KEYS.auth, false));
    setDarkModeState(readStorage(STORAGE_KEYS.darkMode, true));
    setSavedLoadIds(readStorage(STORAGE_KEYS.saved, []));
    setBookedLoadIds(readStorage(STORAGE_KEYS.booked, []));
    setNotifications(
      readStorage(STORAGE_KEYS.notifications, defaultNotifications)
    );
    setProfile(readStorage(STORAGE_KEYS.profile, defaultProfile));
    setImportedLoads(readStorage(STORAGE_KEYS.importedLoads, []));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    writeStorage(STORAGE_KEYS.darkMode, darkMode);
  }, [darkMode]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.auth, isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.saved, savedLoadIds);
  }, [savedLoadIds]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.booked, bookedLoadIds);
  }, [bookedLoadIds]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.notifications, notifications);
  }, [notifications]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.profile, profile);
  }, [profile]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.importedLoads, importedLoads);
  }, [importedLoads]);

  const allLoads = useMemo(
    () => [...importedLoads, ...mockLoads],
    [importedLoads]
  );

  const savedLoads = useMemo(
    () => allLoads.filter((load) => savedLoadIds.includes(load.id)),
    [allLoads, savedLoadIds]
  );

  const bookedLoads = useMemo(
    () => allLoads.filter((load) => bookedLoadIds.includes(load.id)),
    [allLoads, bookedLoadIds]
  );

  const unreadNotifications = notifications.filter((item) => !item.read).length;

  const addNotification = (title: string, description: string) => {
    setNotifications((current) => [
      createNotification(title, description),
      ...current,
    ]);
  };

  const login = ({ email }: { email: string }) => {
    const nextProfile = {
      ...defaultProfile,
      email,
      name: email.split("@")[0].replace(/[._-]/g, " ") || defaultProfile.name,
    };

    setProfile(nextProfile);
    setIsAuthenticated(true);
    addNotification("Welcome back", "Your session is active and ready to use.");
  };

  const logout = () => {
    setIsAuthenticated(false);
    addNotification("Logged out", "You safely signed out from the platform.");
  };

  const toggleDarkMode = () => {
    setDarkModeState((current) => !current);
  };

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
  };

  const toggleSavedLoad = (loadId: string) => {
    let saved = false;

    setSavedLoadIds((current) => {
      if (current.includes(loadId)) {
        addNotification("Removed from saved", `Load ${loadId} was removed.`);
        saved = false;
        return current.filter((id) => id !== loadId);
      }

      addNotification("Load saved", `Load ${loadId} was added to Saved Loads.`);
      saved = true;
      return [...current, loadId];
    });

    return saved;
  };

  const bookLoad = (loadId: string) => {
    let booked = false;

    setBookedLoadIds((current) => {
      if (current.includes(loadId)) {
        booked = false;
        return current;
      }

      addNotification("Load booked", `Load ${loadId} moved to My Loads.`);
      booked = true;
      return [...current, loadId];
    });

    return booked;
  };

  const updateProfile = (payload: UserProfile) => {
    setProfile(payload);
    addNotification("Profile updated", "Your account details were saved.");
  };

  const markAllNotificationsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );
  };

  const importLoads = (loads: Load[]) => {
    const uniqueLoads = loads.filter(
      (incoming) => !allLoads.some((existing) => existing.id === incoming.id)
    );

    if (uniqueLoads.length > 0) {
      setImportedLoads((current) => [...uniqueLoads, ...current]);
      addNotification(
        "DAT import completed",
        `${uniqueLoads.length} ta yangi load platformaga qo'shildi.`
      );
    }

    return uniqueLoads.length;
  };

  const value = useMemo<AppStateValue>(
    () => ({
      allLoads,
      isAuthenticated,
      darkMode,
      savedLoadIds,
      bookedLoadIds,
      notifications,
      searchQuery,
      profile,
      unreadNotifications,
      savedLoads,
      bookedLoads,
      login,
      logout,
      toggleDarkMode,
      setDarkMode,
      setSearchQuery,
      toggleSavedLoad,
      bookLoad,
      updateProfile,
      markAllNotificationsRead,
      importLoads,
    }),
    [
      allLoads,
      isAuthenticated,
      darkMode,
      savedLoadIds,
      bookedLoadIds,
      notifications,
      searchQuery,
      profile,
      unreadNotifications,
      savedLoads,
      bookedLoads,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
