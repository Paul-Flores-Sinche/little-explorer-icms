"use client";

import { useState } from "react";
import { ChevronRight, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFamilyStore } from "@/components/family/family-store";
import { MobilePageHeader } from "@/components/family/mobile-page-header";
import { usePayment } from "@/components/family/payment/payment-context";
import { PaymentSheet } from "@/components/family/payment/payment-sheet";
import { InvoicePreviewDialog } from "@/components/shared/invoice-preview";
import { familyInvoiceDocument } from "@/data/invoices";
import { familyBilling, type Invoice } from "@/data/mock-data";
import type { InvoiceDocument } from "@/lib/documents";

interface InvoiceViewProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
}

function InvoiceList({ invoices, onView }: InvoiceViewProps) {
  if (invoices.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No payments yet.</p>;
  }
  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <button
          key={invoice.number}
          type="button"
          onClick={() => onView(invoice)}
          className="block w-full text-left"
        >
          <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted">
            <div>
              <p className="font-semibold text-foreground">{invoice.period}</p>
              <p className="text-sm text-muted-foreground">
                {invoice.status === "Paid" && invoice.paidWith
                  ? `Paid · ${invoice.paidWith}`
                  : "CCS-adjusted balance"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-semibold text-foreground">${invoice.balance.toFixed(2)}</p>
                <Badge
                  variant={invoice.status === "Paid" ? "success" : "warning"}
                  className="mt-1"
                >
                  {invoice.status}
                </Badge>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}

function InvoiceTable({ invoices, onView }: InvoiceViewProps) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
          <th className="pb-3 font-semibold">Period</th>
          <th className="pb-3 font-semibold">Gross Fee</th>
          <th className="pb-3 font-semibold">CCS Subsidy</th>
          <th className="pb-3 font-semibold">Balance</th>
          <th className="pb-3 font-semibold">Status</th>
          <th className="pb-3 font-semibold" />
        </tr>
      </thead>
      <tbody>
        {invoices.map((invoice) => (
          <tr
            key={invoice.number}
            onClick={() => onView(invoice)}
            className="cursor-pointer border-b border-border last:border-0 hover:bg-muted"
          >
            <td className="py-3 text-foreground">
              {invoice.period}
              <p className="text-xs text-muted-foreground">{invoice.number}</p>
            </td>
            <td className="py-3 text-foreground">${invoice.grossFee.toFixed(2)}</td>
            <td className="py-3 text-foreground">${invoice.ccsSubsidy.toFixed(2)}</td>
            <td className="py-3 font-semibold text-foreground">${invoice.balance.toFixed(2)}</td>
            <td className="py-3">
              <Badge variant={invoice.status === "Paid" ? "success" : "warning"}>
                {invoice.status}
              </Badge>
            </td>
            <td className="py-3 text-right">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                View
                <ChevronRight className="h-4 w-4" />
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function BillingPage() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [preview, setPreview] = useState<InvoiceDocument | null>(null);
  const { balance, invoices, dueDate, markPaid } = usePayment();
  const { profile } = useFamilyStore();
  const paidInvoices = invoices.filter((invoice) => invoice.status === "Paid");

  function openInvoice(invoice: Invoice) {
    setPreview(familyInvoiceDocument(invoice, profile));
  }

  return (
    <>
      <MobilePageHeader title="Billing" backHref="/family" />

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <h1 className="mb-6 hidden font-heading text-3xl font-bold text-foreground md:block">
          Billing
        </h1>

        <div className="gap-6 md:grid md:grid-cols-[320px_1fr]">
          <Card className="mb-6 space-y-4 border-none bg-primary p-6 text-primary-foreground md:mb-0 md:h-fit">
            <div>
              <p className="text-sm text-primary-foreground/70">Current balance</p>
              <p className="font-heading text-4xl font-bold">${balance.toFixed(2)}</p>
              <p className="mt-1 text-sm text-primary-foreground/70">
                {balance <= 0 ? "All paid up — thank you!" : `Includes CCS subsidy · Due ${dueDate}`}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="accent"
                disabled={balance <= 0}
                onClick={() => setPaymentOpen(true)}
              >
                {balance <= 0 ? "Paid" : "Pay Now"}
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-white/10"
                onClick={() => openInvoice(invoices[0])}
              >
                <FileText className="h-4 w-4" />
                View Invoice
              </Button>
            </div>
          </Card>

          <div>
            <div className="md:hidden">
              <Tabs defaultValue="invoices">
                <TabsList className="w-full">
                  <TabsTrigger value="invoices" className="flex-1">
                    Invoices
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    Payment History
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="invoices">
                  <InvoiceList invoices={invoices} onView={openInvoice} />
                </TabsContent>
                <TabsContent value="history">
                  <InvoiceList invoices={paidInvoices} onView={openInvoice} />
                </TabsContent>
              </Tabs>
            </div>

            <Card className="hidden p-6 md:block">
              <h2 className="mb-1 font-heading text-lg font-bold text-foreground">
                Invoices &amp; payment history
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Select an invoice to preview it or download a PDF copy.
              </p>
              <InvoiceTable invoices={invoices} onView={openInvoice} />
            </Card>
          </div>
        </div>
      </div>

      <PaymentSheet
        open={paymentOpen}
        amount={familyBilling.currentBalance}
        onClose={() => setPaymentOpen(false)}
        onSuccess={markPaid}
      />
      <InvoicePreviewDialog invoice={preview} onClose={() => setPreview(null)} />
    </>
  );
}
