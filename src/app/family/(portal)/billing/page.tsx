"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FakeSuccessBanner } from "@/components/fake-success-banner";
import { MobilePageHeader } from "@/components/family/mobile-page-header";
import { familyBilling, type Invoice } from "@/data/mock-data";

function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <Card
          key={invoice.period}
          className="flex items-center justify-between p-4"
        >
          <div>
            <p className="font-semibold text-foreground">{invoice.period}</p>
            <p className="text-sm text-muted-foreground">
              CCS-adjusted balance
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">
              ${invoice.balance.toFixed(2)}
            </p>
            <Badge
              variant={invoice.status === "Paid" ? "success" : "warning"}
              className="mt-1"
            >
              {invoice.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}

function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
          <th className="pb-3 font-semibold">Period</th>
          <th className="pb-3 font-semibold">Gross Fee</th>
          <th className="pb-3 font-semibold">CCS Subsidy</th>
          <th className="pb-3 font-semibold">Balance</th>
          <th className="pb-3 font-semibold">Status</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((invoice) => (
          <tr key={invoice.period} className="border-b border-border last:border-0">
            <td className="py-3 text-foreground">{invoice.period}</td>
            <td className="py-3 text-foreground">
              ${invoice.grossFee.toFixed(2)}
            </td>
            <td className="py-3 text-foreground">
              ${invoice.ccsSubsidy.toFixed(2)}
            </td>
            <td className="py-3 font-semibold text-foreground">
              ${invoice.balance.toFixed(2)}
            </td>
            <td className="py-3">
              <Badge variant={invoice.status === "Paid" ? "success" : "warning"}>
                {invoice.status}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function BillingPage() {
  const [message, setMessage] = useState<string | null>(null);
  const paidInvoices = familyBilling.invoices.filter(
    (invoice) => invoice.status === "Paid",
  );

  return (
    <>
      <MobilePageHeader title="Billing" backHref="/family" />

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <h1 className="mb-6 hidden font-heading text-3xl font-bold text-foreground md:block">
          Billing
        </h1>

        {message && (
          <FakeSuccessBanner
            message={message}
            onDismiss={() => setMessage(null)}
            className="mb-6"
          />
        )}

        <div className="gap-6 md:grid md:grid-cols-[320px_1fr]">
          <Card className="mb-6 space-y-4 border-none bg-primary p-6 text-primary-foreground md:mb-0">
            <div>
              <p className="text-sm text-primary-foreground/70">
                Current balance
              </p>
              <p className="font-heading text-4xl font-bold">
                ${familyBilling.currentBalance.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-primary-foreground/70">
                Includes CCS subsidy · Due {familyBilling.dueDate}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="accent"
                onClick={() => setMessage("Payment received — thank you!")}
              >
                Pay Now
              </Button>
              <Button
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-white/10"
                onClick={() => setMessage("Invoice downloaded.")}
              >
                Download Invoice
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
                  <InvoiceList invoices={familyBilling.invoices} />
                </TabsContent>
                <TabsContent value="history">
                  <InvoiceList invoices={paidInvoices} />
                </TabsContent>
              </Tabs>
            </div>

            <Card className="hidden p-6 md:block">
              <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
                Invoices &amp; payment history
              </h2>
              <InvoiceTable invoices={familyBilling.invoices} />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
