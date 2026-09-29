import { PDF_COLORS, PdfDocument, drawFooter, drawLetterhead } from "@/lib/pdf";

export interface InvoiceLine {
  description: string;
  detail?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceDocument {
  number: string;
  issueDate: string;
  dueDate: string;
  period: string;
  status: string;
  paidWith?: string | null;
  accountName: string;
  address: string;
  email: string;
  children: { name: string; room: string; crn: string; ccsPercent: number }[];
  lines: InvoiceLine[];
  gross: number;
  ccs: number;
  balance: number;
}

export interface ReportTable {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface ReportDocument {
  reference: string;
  title: string;
  scope: string;
  period: string;
  generatedAt: string;
  generatedBy: string;
  summary: string;
  metrics: { label: string; value: string }[];
  tables: ReportTable[];
}

export const money = (value: number) =>
  `$${value.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function buildInvoicePdf(invoice: InvoiceDocument) {
  const pdf = new PdfDocument();
  const right = pdf.width - 40;
  drawLetterhead(pdf, "TAX INVOICE", invoice.number);

  pdf.text("BILL TO", 40, 124, { size: 8, bold: true, color: PDF_COLORS.muted });
  pdf.text(invoice.accountName, 40, 140, { size: 11, bold: true });
  pdf.text(invoice.address, 40, 155, { size: 9, color: PDF_COLORS.muted });
  pdf.text(invoice.email, 40, 168, { size: 9, color: PDF_COLORS.muted });

  const meta: [string, string][] = [
    ["Invoice no.", invoice.number],
    ["Issue date", invoice.issueDate],
    ["Billing period", invoice.period],
    ["Due date", invoice.dueDate],
    ["Status", invoice.status],
  ];
  meta.forEach(([label, value], index) => {
    const y = 124 + index * 14;
    pdf.text(label, 360, y, { size: 9, color: PDF_COLORS.muted });
    pdf.text(value, right, y, { size: 9, bold: true, align: "right" });
  });

  let y = 210;
  pdf.text("CHILDREN", 40, y, { size: 8, bold: true, color: PDF_COLORS.muted });
  y += 14;
  for (const child of invoice.children) {
    pdf.text(`${child.name} — ${child.room}`, 40, y, { size: 9, bold: true });
    pdf.text(`CRN ${child.crn} · CCS ${child.ccsPercent}%`, right, y, { size: 9, color: PDF_COLORS.muted, align: "right" });
    y += 14;
  }

  y += 10;
  pdf.rect(40, y, right - 40, 22, PDF_COLORS.surface);
  pdf.text("Description", 48, y + 14, { size: 8, bold: true, color: PDF_COLORS.muted });
  pdf.text("Qty", 360, y + 14, { size: 8, bold: true, color: PDF_COLORS.muted, align: "right" });
  pdf.text("Unit price", 450, y + 14, { size: 8, bold: true, color: PDF_COLORS.muted, align: "right" });
  pdf.text("Amount", right - 8, y + 14, { size: 8, bold: true, color: PDF_COLORS.muted, align: "right" });
  y += 36;

  for (const line of invoice.lines) {
    pdf.text(line.description, 48, y, { size: 9 });
    if (line.detail) pdf.text(line.detail, 48, y + 11, { size: 8, color: PDF_COLORS.muted });
    pdf.text(String(line.quantity), 360, y, { size: 9, align: "right" });
    pdf.text(money(line.unitPrice), 450, y, { size: 9, align: "right" });
    pdf.text(money(line.amount), right - 8, y, { size: 9, align: "right" });
    y += line.detail ? 26 : 18;
    pdf.line(40, y - 8, right, y - 8);
  }

  y += 10;
  const totals: [string, string, boolean][] = [
    ["Total fees (GST free)", money(invoice.gross), false],
    ["Less: Child Care Subsidy (Services Australia)", `-${money(invoice.ccs)}`, false],
    ["Gap fee payable", money(invoice.balance), true],
  ];
  for (const [label, value, bold] of totals) {
    if (bold) {
      pdf.rect(300, y - 12, right - 300, 22, PDF_COLORS.primary);
      pdf.text(label, 310, y + 3, { size: 10, bold: true, color: PDF_COLORS.white });
      pdf.text(value, right - 8, y + 3, { size: 10, bold: true, color: PDF_COLORS.white, align: "right" });
    } else {
      pdf.text(label, 310, y, { size: 9, color: PDF_COLORS.muted });
      pdf.text(value, right - 8, y, { size: 9, align: "right" });
    }
    y += 20;
  }

  y += 20;
  pdf.text("HOW TO PAY", 40, y, { size: 8, bold: true, color: PDF_COLORS.muted });
  y = pdf.paragraph(
    "Pay securely in the Family Portal (card, PayPal or Apple Pay), by direct debit, or via BPAY — Biller code 123456, Ref " +
      invoice.number.replace(/\D/g, "") +
      ".",
    40,
    y + 14,
    right - 40,
    { size: 9 },
  );
  pdf.paragraph(
    "CCS is paid directly to the centre by Services Australia and has been deducted above. Your CCS percentage is based on your latest assessment; update your details via myGov if your circumstances change.",
    40,
    y + 4,
    right - 40,
    { size: 8, color: PDF_COLORS.muted },
  );

  drawFooter(pdf, "Little Explorer Early Learning Centre · Service approval SE-00067890 · (08) 8981 4420");
  return pdf;
}

export function buildReportPdf(report: ReportDocument) {
  const pdf = new PdfDocument();
  const right = pdf.width - 40;
  drawLetterhead(pdf, "REPORT", report.reference);

  pdf.text(report.title, 40, 128, { size: 16, bold: true });
  pdf.text(`${report.scope} · ${report.period}`, 40, 146, { size: 10, color: PDF_COLORS.muted });
  pdf.text(`Generated ${report.generatedAt} by ${report.generatedBy}`, 40, 160, { size: 9, color: PDF_COLORS.muted });
  let y = pdf.paragraph(report.summary, 40, 184, right - 40, { size: 10 });

  y += 8;
  const columns = 3;
  const cellWidth = (right - 40 - (columns - 1) * 10) / columns;
  report.metrics.forEach((metric, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = 40 + col * (cellWidth + 10);
    const top = y + row * 56;
    pdf.rect(x, top, cellWidth, 46, PDF_COLORS.surface);
    pdf.text(metric.label, x + 10, top + 16, { size: 8, color: PDF_COLORS.muted });
    pdf.text(metric.value, x + 10, top + 36, { size: 14, bold: true, color: PDF_COLORS.primary });
  });
  y += Math.ceil(report.metrics.length / columns) * 56 + 16;

  for (const table of report.tables) {
    if (y > 700) {
      drawFooter(pdf, report.reference);
      pdf.addPage();
      y = 50;
    }
    pdf.text(table.title, 40, y, { size: 11, bold: true });
    y += 12;
    const width = (right - 40) / table.columns.length;
    pdf.rect(40, y, right - 40, 20, PDF_COLORS.surface);
    table.columns.forEach((column, index) => {
      pdf.text(column, 46 + index * width, y + 13, { size: 8, bold: true, color: PDF_COLORS.muted });
    });
    y += 32;
    for (const row of table.rows) {
      if (y > 780) {
        drawFooter(pdf, report.reference);
        pdf.addPage();
        y = 50;
      }
      row.forEach((cell, index) => {
        const maxChars = Math.floor(width / 4.6);
        const value = cell.length > maxChars ? `${cell.slice(0, maxChars - 1)}…` : cell;
        pdf.text(value, 46 + index * width, y, { size: 8.5 });
      });
      pdf.line(40, y + 6, right, y + 6);
      y += 18;
    }
    y += 16;
  }

  drawFooter(pdf, `${report.reference} · Prepared for NQF / ACECQA assessment & rating purposes`);
  return pdf;
}
