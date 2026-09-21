"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { familyBilling, type Invoice } from "@/data/mock-data";

interface PaymentContextValue {
  balance: number;
  dueDate: string;
  invoices: Invoice[];
  markPaid: () => void;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(familyBilling.currentBalance);
  const [invoices, setInvoices] = useState<Invoice[]>(familyBilling.invoices);

  const markPaid = useCallback(() => {
    setBalance(0);
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.status === "Due" || invoice.status === "Overdue"
          ? { ...invoice, balance: 0, status: "Paid" }
          : invoice,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ balance, dueDate: familyBilling.dueDate, invoices, markPaid }),
    [balance, invoices, markPaid],
  );

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
}
