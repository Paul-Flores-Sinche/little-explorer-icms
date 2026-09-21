"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  seedEnquiries,
  type ContactPreference,
  type Enquiry,
  type EnquiryPriority,
  type EnquiryStatus,
  type EnquiryType,
} from "@/data/mock-data";

const STORAGE_KEY = "icms-demo-enquiries";

function cloneSeed(): Enquiry[] {
  return JSON.parse(JSON.stringify(seedEnquiries)) as Enquiry[];
}

function readStorage(): Enquiry[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Enquiry[]) : null;
  } catch {
    return null;
  }
}

function writeStorage(enquiries: Enquiry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
  } catch {
    // Ignore storage failures (private browsing, quota, etc.) — the demo
    // still works in-memory for the current tab.
  }
}

function todayLabelFor(date: Date) {
  return date.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

function generateReference() {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ENQ-${random}`;
}

export interface NewEnquiryInput {
  type: EnquiryType;
  family: string;
  childName?: string;
  room?: string;
  message: string;
  priority: EnquiryPriority;
  contactPreference: ContactPreference;
}

interface EnquiryContextValue {
  enquiries: Enquiry[];
  addEnquiry: (input: NewEnquiryInput) => Enquiry;
  updateEnquiry: (
    id: string,
    patch: Partial<Pick<Enquiry, "status" | "assignedTo" | "internalNotes">>,
  ) => void;
  sendStaffReply: (id: string, text: string, nextStatus: EnquiryStatus) => void;
  markFamilySeen: (id: string) => void;
  resetDemo: () => void;
}

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(cloneSeed);

  // Hydrate from localStorage after mount only, to avoid an SSR/CSR mismatch.
  useEffect(() => {
    const stored = readStorage();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external store (localStorage) that isn't available during SSR
    if (stored) setEnquiries(stored);
  }, []);

  useEffect(() => {
    writeStorage(enquiries);
  }, [enquiries]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      setEnquiries(readStorage() ?? cloneSeed());
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addEnquiry = useCallback((input: NewEnquiryInput) => {
    const now = new Date();
    const dateLabel = todayLabelFor(now);
    const enquiry: Enquiry = {
      id: `enq-${now.getTime()}`,
      reference: generateReference(),
      type: input.type,
      family: input.family,
      childName: input.childName,
      room: input.room,
      message: input.message,
      priority: input.priority,
      contactPreference: input.contactPreference,
      status: "New",
      date: dateLabel,
      internalNotes: "",
      assignedTo: null,
      familyUnread: false,
      thread: [{ from: "family", text: input.message, date: dateLabel }],
    };
    setEnquiries((prev) => [enquiry, ...prev]);
    return enquiry;
  }, []);

  const updateEnquiry = useCallback<EnquiryContextValue["updateEnquiry"]>((id, patch) => {
    setEnquiries((prev) =>
      prev.map((enquiry) =>
        enquiry.id === id
          ? {
              ...enquiry,
              ...patch,
              familyUnread:
                patch.status && patch.status !== enquiry.status ? true : enquiry.familyUnread,
            }
          : enquiry,
      ),
    );
  }, []);

  const sendStaffReply = useCallback((id: string, text: string, nextStatus: EnquiryStatus) => {
    const dateLabel = todayLabelFor(new Date());
    setEnquiries((prev) =>
      prev.map((enquiry) =>
        enquiry.id === id
          ? {
              ...enquiry,
              status: nextStatus,
              familyUnread: true,
              thread: [...enquiry.thread, { from: "staff", text, date: dateLabel }],
            }
          : enquiry,
      ),
    );
  }, []);

  const markFamilySeen = useCallback((id: string) => {
    setEnquiries((prev) =>
      prev.map((enquiry) => (enquiry.id === id ? { ...enquiry, familyUnread: false } : enquiry)),
    );
  }, []);

  const resetDemo = useCallback(() => {
    setEnquiries(cloneSeed());
  }, []);

  const value = useMemo(
    () => ({
      enquiries,
      addEnquiry,
      updateEnquiry,
      sendStaffReply,
      markFamilySeen,
      resetDemo,
    }),
    [enquiries, addEnquiry, updateEnquiry, sendStaffReply, markFamilySeen, resetDemo],
  );

  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

export function useEnquiries() {
  const context = useContext(EnquiryContext);
  if (!context) {
    throw new Error("useEnquiries must be used within an EnquiryProvider");
  }
  return context;
}
