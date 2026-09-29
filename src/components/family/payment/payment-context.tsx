"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useFamilyStore } from "@/components/family/family-store";
import { familyBilling, type Invoice } from "@/data/mock-data";
import { usePersistentState } from "@/lib/use-persistent-state";

export interface PaymentResult {
  amount: number;
  methodLabel: string;
  receiptNumber: string;
}

interface PaymentContextValue {
  balance: number;
  dueDate: string;
  invoices: Invoice[];
  markPaid: (result: PaymentResult) => void;
  resetPayments: () => void;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = usePersistentState("icms-demo-family-balance", familyBilling.currentBalance);
  const [invoices, setInvoices] = usePersistentState<Invoice[]>(
    "icms-demo-family-invoices",
    familyBilling.invoices,
  );
  const { addNotification } = useFamilyStore();

  const markPaid = useCallback(
    ({ amount, methodLabel, receiptNumber }: PaymentResult) => {
      setBalance(0);
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.status === "Due" || invoice.status === "Overdue"
            ? { ...invoice, status: "Paid", paidWith: methodLabel }
            : invoice,
        ),
      );
      addNotification({
        icon: "payment",
        title: "Payment received — thank you",
        body: `We received your payment of $${amount.toFixed(2)} via ${methodLabel}. Receipt No. ${receiptNumber}.`,
        link: "/family/billing",
      });
    },
    [addNotification, setBalance, setInvoices],
  );

  const resetPayments = useCallback(() => {
    setBalance(familyBilling.currentBalance);
    setInvoices(familyBilling.invoices);
  }, [setBalance, setInvoices]);

  const value = useMemo(
    () => ({ balance, dueDate: familyBilling.dueDate, invoices, markPaid, resetPayments }),
    [balance, invoices, markPaid, resetPayments],
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
