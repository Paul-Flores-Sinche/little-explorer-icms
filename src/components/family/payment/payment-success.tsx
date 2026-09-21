import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaymentSuccessProps {
  amount: number;
  methodLabel: string;
  receiptNumber: string;
  onBackToBilling: () => void;
}

export function PaymentSuccess({
  amount,
  methodLabel,
  receiptNumber,
  onBackToBilling,
}: PaymentSuccessProps) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success">
        <CheckCircle2 className="h-9 w-9 text-success-foreground" />
      </span>
      <h2 className="font-heading text-xl font-bold text-foreground">Payment successful</h2>
      <p className="mt-1 font-heading text-3xl font-bold text-foreground">${amount.toFixed(2)}</p>
      <p className="mt-2 text-sm text-muted-foreground">Paid with {methodLabel}</p>
      <p className="mt-1 text-xs text-muted-foreground">Receipt No. {receiptNumber}</p>
      <Button type="button" variant="accent" className="mt-8 w-full" onClick={onBackToBilling}>
        Back to Billing
      </Button>
    </div>
  );
}
