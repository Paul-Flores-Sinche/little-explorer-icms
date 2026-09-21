export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "unionpay"
  | "maestro"
  | "interac"
  | "discover";

export const ACCEPTED_BRANDS: CardBrand[] = [
  "visa",
  "mastercard",
  "amex",
  "unionpay",
  "maestro",
  "interac",
  "discover",
];

export function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return (digits.match(/.{1,4}/g) ?? []).join(" ");
}

export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function detectCardBrand(value: string): CardBrand | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return null;
}

export function luhnCheck(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isExpiryValid(value: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

export function isCvvValid(value: string) {
  return /^\d{3,4}$/.test(value);
}

export function generateReceiptNumber() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `LE-${new Date().getFullYear()}-${random}`;
}
