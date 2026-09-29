import { formatRange, formatShort, fromKey, WEEKDAYS_SHORT, weekdayIndex } from "@/lib/dates";
import type { InvoiceDocument, InvoiceLine } from "@/lib/documents";

import {
  WEEKLY_LEVY,
  ava,
  familyById,
  roomConfig,
  type FamilyCharge,
} from "./centre";
import type { Invoice } from "./mock-data";

/** Invoice document for a staff-side family charge (weekly or single-day). */
export function invoiceFromCharge(charge: FamilyCharge): InvoiceDocument {
  const lines: InvoiceLine[] = [];
  for (const child of charge.family.children) {
    const childLines = charge.lines.filter((line) => line.childName === child.name);
    if (childLines.length === 0) continue;
    const days = childLines.map((line) => WEEKDAYS_SHORT[weekdayIndex(fromKey(line.date))]).join(", ");
    const fee = roomConfig[child.room].dailyFee;
    lines.push({
      description: `${child.name} — ${child.room} long day session`,
      detail: `${days} · 7:00am – 6:00pm`,
      quantity: childLines.length,
      unitPrice: fee,
      amount: fee * childLines.length,
    });
  }
  if (charge.levy > 0) {
    lines.push({
      description: "Centre levy (weekly)",
      detail: "Consumables, sunscreen & excursion insurance",
      quantity: 1,
      unitPrice: charge.levy,
      amount: charge.levy,
    });
  }

  const start = fromKey(charge.periodStart);
  const end = fromKey(charge.periodEnd);
  return {
    number: charge.invoiceNumber,
    issueDate: formatShort(start),
    dueDate: formatShort(fromKey(charge.dueDate)),
    period: charge.periodStart === charge.periodEnd ? formatShort(start) : formatRange(start, end),
    status: charge.status,
    paidWith: charge.paidWith,
    accountName: charge.family.guardian,
    address: charge.family.address,
    email: charge.family.email,
    children: charge.family.children
      .filter((child) => charge.lines.some((line) => line.childName === child.name))
      .map((child) => ({ name: child.name, room: child.room, crn: child.crn, ccsPercent: child.ccsPercent })),
    lines,
    gross: charge.grossFee,
    ccs: charge.ccsSubsidy,
    balance: charge.balance,
  };
}

/** Invoice document for one of Sarah Thompson's invoices in the Family Portal. */
export function familyInvoiceDocument(
  invoice: Invoice,
  account: { name: string; address: string; email: string },
): InvoiceDocument {
  const fee = roomConfig[ava.room].dailyFee;
  const sessions = (invoice.grossFee - WEEKLY_LEVY) / fee;
  const days = ava.bookedDays.map((day) => WEEKDAYS_SHORT[day]).join(", ");
  const family = familyById[ava.familyId];

  return {
    number: invoice.number,
    issueDate: invoice.issued,
    dueDate: invoice.due,
    period: invoice.period,
    status: invoice.status,
    paidWith: invoice.paidWith ?? null,
    accountName: account.name,
    address: account.address || family.address,
    email: account.email,
    children: [{ name: ava.name, room: ava.room, crn: ava.crn, ccsPercent: ava.ccsPercent }],
    lines: [
      {
        description: `${ava.name} — ${ava.room} long day session`,
        detail: `${days} · 7:00am – 6:00pm`,
        quantity: sessions,
        unitPrice: fee,
        amount: fee * sessions,
      },
      {
        description: "Centre levy (weekly)",
        detail: "Consumables, sunscreen & excursion insurance",
        quantity: 1,
        unitPrice: WEEKLY_LEVY,
        amount: WEEKLY_LEVY,
      },
    ],
    gross: invoice.grossFee,
    ccs: invoice.ccsSubsidy,
    balance: invoice.balance,
  };
}
