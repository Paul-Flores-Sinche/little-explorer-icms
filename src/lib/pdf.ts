// Minimal PDF writer (text, lines and filled rectangles on A4 pages) so the
// demo can produce real downloadable documents without extra dependencies.
// Coordinates are in points from the TOP-left corner of the page.

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

type Rgb = [number, number, number];

export const PDF_COLORS = {
  text: [0.14, 0.16, 0.12] as Rgb,
  muted: [0.47, 0.44, 0.37] as Rgb,
  primary: [0.184, 0.435, 0.369] as Rgb,
  accent: [0.91, 0.53, 0.35] as Rgb,
  border: [0.91, 0.88, 0.82] as Rgb,
  surface: [0.98, 0.97, 0.95] as Rgb,
  white: [1, 1, 1] as Rgb,
};

// WinAnsi code points for the few non-ASCII characters used in the app.
const WIN_ANSI: Record<string, number> = {
  "–": 0x96,
  "—": 0x97,
  "·": 0xb7,
  "•": 0x95,
  "’": 0x92,
  "‘": 0x91,
  "“": 0x93,
  "”": 0x94,
  "…": 0x85,
};

// Helvetica glyph widths (per 1000 em) for characters that matter when
// right-aligning numbers; everything else uses an average width.
const WIDTHS: Record<string, number> = {
  " ": 278, ".": 278, ",": 278, "-": 333, "$": 556, "%": 889, "/": 278, ":": 278,
  "0": 556, "1": 556, "2": 556, "3": 556, "4": 556, "5": 556, "6": 556, "7": 556, "8": 556, "9": 556,
};

function encode(text: string) {
  let out = "";
  for (const char of text) {
    const code = WIN_ANSI[char] ?? char.charCodeAt(0);
    const byte = code < 256 ? code : 63; // "?"
    const c = String.fromCharCode(byte);
    out += c === "(" || c === ")" || c === "\\" ? `\\${c}` : c;
  }
  return out;
}

export function textWidth(text: string, size: number, bold = false) {
  let width = 0;
  for (const char of text) width += WIDTHS[char] ?? (bold ? 590 : 540);
  return (width / 1000) * size;
}

function color([r, g, b]: Rgb) {
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
}

interface TextOptions {
  size?: number;
  bold?: boolean;
  color?: Rgb;
  align?: "left" | "right" | "center";
}

export class PdfDocument {
  private pages: string[][] = [[]];

  get width() {
    return PAGE_WIDTH;
  }

  get height() {
    return PAGE_HEIGHT;
  }

  addPage() {
    this.pages.push([]);
  }

  private get ops() {
    return this.pages[this.pages.length - 1];
  }

  text(value: string, x: number, y: number, options: TextOptions = {}) {
    const size = options.size ?? 10;
    const width = textWidth(value, size, options.bold);
    const left =
      options.align === "right" ? x - width : options.align === "center" ? x - width / 2 : x;
    this.ops.push(
      `BT ${color(options.color ?? PDF_COLORS.text)} rg /${options.bold ? "F2" : "F1"} ${size} Tf ${left.toFixed(2)} ${(PAGE_HEIGHT - y).toFixed(2)} Td (${encode(value)}) Tj ET`,
    );
  }

  /** Wraps `value` to `maxWidth` and returns the y position after the block. */
  paragraph(value: string, x: number, y: number, maxWidth: number, options: TextOptions = {}) {
    const size = options.size ?? 10;
    const lineHeight = size * 1.45;
    let line = "";
    let cursor = y;
    for (const word of value.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (textWidth(candidate, size, options.bold) > maxWidth && line) {
        this.text(line, x, cursor, options);
        cursor += lineHeight;
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) {
      this.text(line, x, cursor, options);
      cursor += lineHeight;
    }
    return cursor;
  }

  line(x1: number, y1: number, x2: number, y2: number, stroke: Rgb = PDF_COLORS.border, width = 1) {
    this.ops.push(
      `${color(stroke)} RG ${width} w ${x1} ${PAGE_HEIGHT - y1} m ${x2} ${PAGE_HEIGHT - y2} l S`,
    );
  }

  rect(x: number, y: number, w: number, h: number, fill: Rgb) {
    this.ops.push(`${color(fill)} rg ${x} ${PAGE_HEIGHT - y - h} ${w} ${h} re f`);
  }

  toBlob() {
    const objects: string[] = [];
    const pageCount = this.pages.length;
    // 1: catalog, 2: pages, 3: font regular, 4: font bold, then page/content pairs.
    const pageIds = this.pages.map((_, index) => 5 + index * 2);

    objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageCount} >>`;
    objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

    this.pages.forEach((ops, index) => {
      const pageId = pageIds[index];
      const content = ops.join("\n");
      objects[pageId] =
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${pageId + 1} 0 R >>`;
      objects[pageId + 1] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    });

    let output = "%PDF-1.4\n";
    const offsets: number[] = [];
    for (let id = 1; id < objects.length; id += 1) {
      offsets[id] = output.length;
      output += `${id} 0 obj\n${objects[id]}\nendobj\n`;
    }
    const xrefStart = output.length;
    output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objects.length; id += 1) {
      output += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
    }
    output += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    const bytes = new Uint8Array(output.length);
    for (let i = 0; i < output.length; i += 1) bytes[i] = output.charCodeAt(i) & 0xff;
    return new Blob([bytes], { type: "application/pdf" });
  }

  save(filename: string) {
    downloadBlob(this.toBlob(), filename);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell);
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    )
    .join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename);
}

/** Shared letterhead used by every generated document. */
export function drawLetterhead(pdf: PdfDocument, title: string, subtitle?: string) {
  pdf.rect(0, 0, PAGE_WIDTH, 92, PDF_COLORS.primary);
  pdf.text("Little Explorer", 40, 40, { size: 20, bold: true, color: PDF_COLORS.white });
  pdf.text("Early Learning Centre", 40, 58, { size: 10, color: PDF_COLORS.white });
  pdf.text("25 Mitchell Street, Darwin City NT 0800 · ABN 12 345 678 901", 40, 74, {
    size: 8,
    color: PDF_COLORS.white,
  });
  pdf.text(title, PAGE_WIDTH - 40, 44, { size: 18, bold: true, color: PDF_COLORS.white, align: "right" });
  if (subtitle) {
    pdf.text(subtitle, PAGE_WIDTH - 40, 62, { size: 10, color: PDF_COLORS.white, align: "right" });
  }
}

export function drawFooter(pdf: PdfDocument, note: string) {
  pdf.line(40, PAGE_HEIGHT - 50, PAGE_WIDTH - 40, PAGE_HEIGHT - 50);
  pdf.text(note, 40, PAGE_HEIGHT - 34, { size: 8, color: PDF_COLORS.muted });
  pdf.text("Demo document — generated by the Little Explorer ICMS prototype", PAGE_WIDTH - 40, PAGE_HEIGHT - 34, {
    size: 8,
    color: PDF_COLORS.muted,
    align: "right",
  });
}
