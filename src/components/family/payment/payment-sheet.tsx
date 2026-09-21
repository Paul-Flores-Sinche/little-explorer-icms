"use client";

import { useEffect, useState } from "react";
import { Apple, CreditCard, Loader2, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CardBrandBadge } from "./card-brand-badge";
import { CardForm, type CardFormErrors, type CardFormValues } from "./card-form";
import { PaymentMethodOption } from "./payment-method-option";
import { PaymentSuccess } from "./payment-success";
import {
  ACCEPTED_BRANDS,
  detectCardBrand,
  generateReceiptNumber,
  isCvvValid,
  isExpiryValid,
  luhnCheck,
} from "./utils";

type Method = "paypal" | "card" | "applepay";
type Step = "select" | "processing" | "success";

const EMPTY_CARD: CardFormValues = {
  number: "",
  name: "",
  expiry: "",
  cvv: "",
  saveCard: false,
};

const METHOD_LABEL: Record<Method, string> = {
  paypal: "PayPal",
  card: "Credit / Debit Card",
  applepay: "Apple Pay",
};

interface PaymentSheetProps {
  open: boolean;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentSheet({ open, amount, onClose, onSuccess }: PaymentSheetProps) {
  const [step, setStep] = useState<Step>("select");
  const [method, setMethod] = useState<Method | null>(null);
  const [card, setCard] = useState<CardFormValues>(EMPTY_CARD);
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [receiptNumber, setReceiptNumber] = useState("");
  const [paidWith, setPaidWith] = useState<Method | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function reset() {
    setStep("select");
    setMethod(null);
    setCard(EMPTY_CARD);
    setErrors({});
    setReceiptNumber("");
    setPaidWith(null);
  }

  function handleClose() {
    if (step === "processing") return;
    reset();
    onClose();
  }

  function startProcessing(paidMethod: Method) {
    setPaidWith(paidMethod);
    setStep("processing");
    window.setTimeout(() => {
      setReceiptNumber(generateReceiptNumber());
      setStep("success");
      onSuccess();
    }, 1500);
  }

  function handleCardFieldChange<K extends keyof CardFormValues>(field: K, value: CardFormValues[K]) {
    setCard((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleUseTestCard() {
    setCard((prev) => ({ ...prev, number: "4242 4242 4242 4242", expiry: "12/30", cvv: "123" }));
    setErrors({});
  }

  function handleCardSubmit() {
    const nextErrors: CardFormErrors = {};
    if (!luhnCheck(card.number)) nextErrors.number = "Enter a valid card number";
    if (!card.name.trim()) nextErrors.name = "Enter the name on the card";
    if (!isExpiryValid(card.expiry)) nextErrors.expiry = "Enter a valid, non-expired date";
    if (!isCvvValid(card.cvv)) nextErrors.cvv = "Enter a valid CVV";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    startProcessing("card");
  }

  function handleBackToBilling() {
    reset();
    onClose();
  }

  if (!open) return null;

  const brand = detectCardBrand(card.number);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={handleClose}
        className="absolute inset-0 bg-foreground/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-sheet-title"
        className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-card md:max-w-md md:rounded-2xl md:shadow-xl"
      >
        {step === "success" ? (
          <PaymentSuccess
            amount={amount}
            methodLabel={paidWith ? METHOD_LABEL[paidWith] : ""}
            receiptNumber={receiptNumber}
            onBackToBilling={handleBackToBilling}
          />
        ) : step === "processing" ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Processing your payment…</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <h2 id="payment-sheet-title" className="font-heading text-xl font-bold text-foreground md:text-2xl">
                  Payment Method
                </h2>
                <ShieldCheck
                  className="h-6 w-6 shrink-0"
                  fill="#2F6F5E"
                  stroke="white"
                  strokeWidth={2}
                />
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4">
              <p className="text-sm text-muted-foreground">Amount to pay</p>
              <p className="mb-4 font-heading text-3xl font-bold text-foreground">${amount.toFixed(2)}</p>

              <div className="mb-4 rounded-xl border border-warning-foreground/20 bg-warning px-4 py-3 text-xs font-medium text-warning-foreground">
                Demo only — do not enter real card details.
              </div>

              <div>
                <PaymentMethodOption
                  label="PayPal"
                  selected={method === "paypal"}
                  onSelect={() => setMethod("paypal")}
                  icon={
                    <span className="flex h-full w-full items-center justify-center bg-[#DCEEFC] text-xs font-black italic text-[#003087]">
                      Pay<span className="text-[#009CDE]">Pal</span>
                    </span>
                  }
                >
                  <div className="rounded-xl bg-muted p-4">
                    <p className="mb-3 text-sm text-muted-foreground">
                      You will be redirected to PayPal to complete your payment.
                    </p>
                    <Button
                      type="button"
                      className="w-full bg-[#0070BA] text-white hover:bg-[#0070BA]/90"
                      onClick={() => startProcessing("paypal")}
                    >
                      Continue with PayPal
                    </Button>
                  </div>
                </PaymentMethodOption>

                <PaymentMethodOption
                  label="Credit / Debit Card"
                  selected={method === "card"}
                  expandable
                  onSelect={() => setMethod("card")}
                  icon={
                    <span className="flex h-full w-full items-center justify-center bg-muted">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </span>
                  }
                >
                  <CardForm
                    values={card}
                    errors={errors}
                    brand={brand}
                    onFieldChange={handleCardFieldChange}
                    onUseTestCard={handleUseTestCard}
                  />
                  <Button type="button" variant="accent" className="mt-4 w-full" onClick={handleCardSubmit}>
                    Pay ${amount.toFixed(2)}
                  </Button>
                </PaymentMethodOption>

                <PaymentMethodOption
                  label="Apple Pay"
                  selected={method === "applepay"}
                  onSelect={() => setMethod("applepay")}
                  icon={
                    <span className="flex h-full w-full items-center justify-center gap-0.5 bg-white">
                      <Apple className="h-3.5 w-3.5 text-foreground" fill="currentColor" />
                      <span className="text-sm font-semibold text-foreground">Pay</span>
                    </span>
                  }
                >
                  <Button
                    type="button"
                    className="w-full rounded-xl bg-black text-white hover:bg-black/90"
                    onClick={() => startProcessing("applepay")}
                  >
                    Pay
                  </Button>
                </PaymentMethodOption>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {ACCEPTED_BRANDS.map((accepted) => (
                  <CardBrandBadge key={accepted} brand={accepted} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
