"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import {
  defaultNotificationPreferences,
  familyNotifications,
  familyProfile,
  type FamilyNotification,
  type NotificationCategoryId,
  type NotificationChannel,
} from "@/data/mock-data";
import { formatTime, toKey } from "@/lib/dates";
import { usePersistentState } from "@/lib/use-persistent-state";

export interface FamilyProfileState {
  name: string;
  email: string;
  phone: string;
  address: string;
  faceId: boolean;
  preferences: Record<NotificationCategoryId, NotificationChannel[]>;
}

export interface StoredNotification extends FamilyNotification {
  /** yyyy-mm-dd the notification was created. */
  date: string;
}

const DEFAULT_PROFILE: FamilyProfileState = {
  name: familyProfile.name,
  email: familyProfile.email,
  phone: familyProfile.phone,
  address: familyProfile.address,
  faceId: familyProfile.faceIdLogin,
  preferences: defaultNotificationPreferences,
};

interface FamilyStoreValue {
  profile: FamilyProfileState;
  updateProfile: (patch: Partial<FamilyProfileState>) => void;
  notifications: StoredNotification[];
  addNotification: (input: Omit<FamilyNotification, "id" | "time" | "unread">) => void;
  isUnread: (item: FamilyNotification) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  hasUnread: boolean;
  likedObservations: string[];
  toggleLike: (id: string) => void;
  resetFamilyDemo: () => void;
}

const FamilyStoreContext = createContext<FamilyStoreValue | null>(null);

const seedItems = familyNotifications.flatMap((group) => group.items);

export function FamilyStoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = usePersistentState("icms-demo-family-profile", DEFAULT_PROFILE);
  const [notifications, setNotifications] = usePersistentState<StoredNotification[]>(
    "icms-demo-family-notifications",
    [],
  );
  const [readIds, setReadIds] = usePersistentState<string[]>("icms-demo-family-read", []);
  const [likedObservations, setLiked] = usePersistentState<string[]>("icms-demo-family-likes", []);

  const updateProfile = useCallback(
    (patch: Partial<FamilyProfileState>) => setProfile((prev) => ({ ...prev, ...patch })),
    [setProfile],
  );

  const addNotification = useCallback<FamilyStoreValue["addNotification"]>(
    (input) => {
      const now = new Date();
      setNotifications((prev) => [
        {
          ...input,
          id: `n-${now.getTime()}`,
          time: formatTime(now.getHours() * 60 + now.getMinutes()),
          unread: true,
          date: toKey(now),
        },
        ...prev,
      ]);
    },
    [setNotifications],
  );

  const isUnread = useCallback(
    (item: FamilyNotification) => Boolean(item.unread) && !readIds.includes(item.id),
    [readIds],
  );

  const markRead = useCallback(
    (id: string) => setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setReadIds],
  );

  const markAllRead = useCallback(() => {
    setReadIds([...seedItems, ...notifications].map((item) => item.id));
  }, [notifications, setReadIds]);

  const toggleLike = useCallback(
    (id: string) =>
      setLiked((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id])),
    [setLiked],
  );

  const resetFamilyDemo = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    setNotifications([]);
    setReadIds([]);
    setLiked([]);
  }, [setProfile, setNotifications, setReadIds, setLiked]);

  const hasUnread = [...seedItems, ...notifications].some(isUnread);

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      notifications,
      addNotification,
      isUnread,
      markRead,
      markAllRead,
      hasUnread,
      likedObservations,
      toggleLike,
      resetFamilyDemo,
    }),
    [
      profile,
      updateProfile,
      notifications,
      addNotification,
      isUnread,
      markRead,
      markAllRead,
      hasUnread,
      likedObservations,
      toggleLike,
      resetFamilyDemo,
    ],
  );

  return <FamilyStoreContext.Provider value={value}>{children}</FamilyStoreContext.Provider>;
}

export function useFamilyStore() {
  const context = useContext(FamilyStoreContext);
  if (!context) {
    throw new Error("useFamilyStore must be used within a FamilyStoreProvider");
  }
  return context;
}
