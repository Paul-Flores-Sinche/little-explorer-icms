"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { staffById } from "@/data/centre";
import {
  currentStaffId,
  defaultStaffNotificationPreferences,
  type NotificationChannel,
  type StaffNotificationCategoryId,
} from "@/data/mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export interface StaffProfileState {
  name: string;
  email: string;
  phone: string;
  faceId: boolean;
  preferences: Record<StaffNotificationCategoryId, NotificationChannel[]>;
}

const member = staffById[currentStaffId];

const DEFAULT_PROFILE: StaffProfileState = {
  name: member.name,
  email: member.email,
  phone: member.phone,
  faceId: false,
  preferences: defaultStaffNotificationPreferences,
};

interface StaffProfileValue {
  profile: StaffProfileState;
  updateProfile: (patch: Partial<StaffProfileState>) => void;
  resetStaffProfile: () => void;
}

const StaffProfileContext = createContext<StaffProfileValue | null>(null);

export function StaffProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = usePersistentState("icms-demo-staff-profile", DEFAULT_PROFILE);

  const updateProfile = useCallback(
    (patch: Partial<StaffProfileState>) => setProfile((prev) => ({ ...prev, ...patch })),
    [setProfile],
  );

  const resetStaffProfile = useCallback(() => setProfile(DEFAULT_PROFILE), [setProfile]);

  const value = useMemo(
    () => ({ profile, updateProfile, resetStaffProfile }),
    [profile, updateProfile, resetStaffProfile],
  );

  return <StaffProfileContext.Provider value={value}>{children}</StaffProfileContext.Provider>;
}

export function useStaffProfile() {
  const context = useContext(StaffProfileContext);
  if (!context) throw new Error("useStaffProfile must be used inside StaffProfileProvider");
  return context;
}
