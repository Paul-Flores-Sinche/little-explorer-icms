"use client";

import { useState, type ReactNode } from "react";
import { Download, Loader2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { centreDetails } from "@/data/centre";
import { buildInvoicePdf, money, type InvoiceDocument } from "@/lib/documents";

function statusVariant(status: string) {
  if (status === "Paid") return "success" as const;
  if (status.startsWith("Overdue")) return "danger" as const;
  return "warning" as const;
}

/** Paper-style rendering of a tax invoice, shared by both portals. */
export function InvoicePreview({ invoice }: { invoice: InvoiceDocument }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white text-sm shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 bg-primary px-5 py-4 text-primary-foreground">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-heading text-lg font-bold">Little Explorer</span>
          </div>
          <p className="text-xs text-primary-foreground/80">{centreDetails.name}</p>
          <p className="text-xs text-primary-foreground/70">
            {centreDetails.address} · ABN {centreDetails.abn}
          </p>
        </div>
        <div className="text-right">
          <p className="font-heading text-lg font-bold tracking-wide">TAX INVOICE</p>
          <p className="text-xs text-primary-foreground/80">{invoice.number}</p>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Bill to</p>
          <p className="mt-1 font-semibold text-foreground">{invoice.accountName}</p>
          <p className="text-xs text-muted-foreground">{invoice.address}</p>
          <p className="text-xs text-muted-foreground">{invoice.email}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <dt className="text-muted-foreground">Issue date</dt>
          <dd className="text-right font-medium text-foreground">{invoice.issueDate}</dd>
          <dt className="text-muted-foreground">Billing period</dt>
          <dd className="text-right font-medium text-foreground">{invoice.period}</dd>
          <dt className="text-muted-foreground">Due date</dt>
          <dd className="text-right font-medium text-foreground">{invoice.dueDate}</dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="flex justify-end">
            <Badge variant={statusVariant(invoice.status)} className="px-2 py-0.5">
              {invoice.status}
            </Badge>
          </dd>
        </dl>
      </div>

      <div className="mx-5 space-y-1 rounded-lg bg-muted/60 px-3 py-2 text-xs">
        {invoice.children.map((child) => (
          <div key={child.name} className="flex flex-wrap justify-between gap-2">
            <span className="font-semibold text-foreground">
              {child.name} · {child.room}
            </span>
            <span className="text-muted-foreground">
              CRN {child.crn} · CCS {child.ccsPercent}%
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto px-5 py-4">
        <table className="w-full min-w-[420px] text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground uppercase">
              <th className="pb-2 font-semibold">Description</th>
              <th className="pb-2 text-right font-semibold">Qty</th>
              <th className="pb-2 text-right font-semibold">Unit</th>
              <th className="pb-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={line.description + line.detail} className="border-b border-border">
                <td className="py-2 text-foreground">
                  {line.description}
                  {line.detail && <p className="text-[11px] text-muted-foreground">{line.detail}</p>}
                </td>
                <td className="py-2 text-right text-foreground">{line.quantity}</td>
                <td className="py-2 text-right text-foreground">{money(line.unitPrice)}</td>
                <td className="py-2 text-right font-medium text-foreground">{money(line.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-3 ml-auto max-w-xs space-y-1.5 text-xs">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Total fees (GST free)</dt>
            <dd className="font-medium text-foreground">{money(invoice.gross)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Less: Child Care Subsidy</dt>
            <dd className="font-medium text-success-foreground">-{money(invoice.ccs)}</dd>
          </div>
          <div className="flex justify-between rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
            <dt className="font-semibold">Gap fee payable</dt>
            <dd className="font-bold">{money(invoice.balance)}</dd>
          </div>
        </dl>
      </div>

      <p className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
        {invoice.status === "Paid" && invoice.paidWith
          ? `Paid in full via ${invoice.paidWith} — thank you.`
          : "Pay in the Family Portal, by direct debit or BPAY (Biller code 123456)."}{" "}
        CCS is paid directly to the centre by Services Australia.
      </p>
    </div>
  );
}

interface InvoicePreviewDialogProps {
  invoice: InvoiceDocument | null;
  onClose: () => void;
  actions?: ReactNode;
}

export function InvoicePreviewDialog({ invoice, onClose, actions }: InvoicePreviewDialogProps) {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  function handleDownload() {
    if (!invoice) return;
    setDownloading(true);
    window.setTimeout(() => {
      buildInvoicePdf(invoice).save(`${invoice.number}.pdf`);
      setDownloading(false);
      toast({ title: "Invoice downloaded", description: `${invoice.number}.pdf saved to your downloads.` });
    }, 700);
  }

  return (
    <Dialog
      open={invoice !== null}
      onClose={onClose}
      title="Invoice preview"
      description={invoice ? `${invoice.number} · ${invoice.period}` : undefined}
      size="lg"
      footer={
        <>
          {actions}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload} disabled={downloading} className="gap-2">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Preparing PDF…" : "Download as PDF"}
          </Button>
        </>
      }
    >
      {invoice && <InvoicePreview invoice={invoice} />}
    </Dialog>
  );
}
