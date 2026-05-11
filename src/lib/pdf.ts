import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { GeneratorInput, LayoutVariant } from "./generator";
import { A4_MM, calcTiling } from "./generator";

const MM_TO_PT = 72 / 25.4;

function mm(mm: number) {
  return mm * MM_TO_PT;
}

export async function createPrintPdf(input: GeneratorInput, variant: LayoutVariant) {
  const { cols, rows, wallWmm, wallHmm, tileW, tileH } = calcTiling(input);
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const page = pdf.addPage([mm(A4_MM.width), mm(A4_MM.height)]);
      const pw = page.getWidth();
      const ph = page.getHeight();
      const margin = mm(input.marginMm);
      const innerW = pw - margin * 2;
      const innerH = ph - margin * 2;

      const xMm = c * tileW;
      const yMm = r * tileH;
      const nx = xMm / wallWmm;
      const ny = yMm / wallHmm;

      const c1 = hexToRgb(variant.bgA);
      const c2 = hexToRgb(variant.bgB);
      const mix = 0.55 * nx + 0.45 * ny;
      const bg = {
        r: c1.r * (1 - mix) + c2.r * mix,
        g: c1.g * (1 - mix) + c2.g * mix,
        b: c1.b * (1 - mix) + c2.b * mix
      };

      page.drawRectangle({
        x: margin,
        y: margin,
        width: innerW,
        height: innerH,
        color: rgb(bg.r, bg.g, bg.b)
      });

      page.drawRectangle({
        x: margin + mm(2),
        y: margin + mm(2),
        width: innerW - mm(4),
        height: innerH - mm(4),
        borderWidth: mm(1),
        borderColor: rgb(0.6, 0.6, 0.6)
      });

      const centerX = margin + innerW / 2;
      const centerY = margin + innerH / 2;
      const radius = Math.min(innerW, innerH) * 0.18;
      const accent = hexToRgb(variant.accent);

      page.drawCircle({
        x: centerX,
        y: centerY,
        size: radius,
        color: rgb(accent.r, accent.g, accent.b),
        opacity: 0.2
      });

      const label = `${variant.name} | ${variant.headline}`;
      page.drawText(label, {
        x: margin + mm(8),
        y: ph - margin - mm(14),
        size: 10,
        font,
        color: rgb(0.18, 0.18, 0.18),
        maxWidth: innerW - mm(16)
      });

      const tileIndex = r * cols + c + 1;
      page.drawText(`Лист ${tileIndex}/${cols * rows} (R${r + 1} C${c + 1})`, {
        x: margin + mm(8),
        y: margin + mm(6),
        size: 9,
        font,
        color: rgb(0.2, 0.2, 0.2)
      });

      drawCross(page, margin, margin, 8);
      drawCross(page, pw - margin, margin, 8);
      drawCross(page, margin, ph - margin, 8);
      drawCross(page, pw - margin, ph - margin, 8);
    }
  }

  return pdf.save();
}

function drawCross(page: any, x: number, y: number, lenMm: number) {
  const l = mm(lenMm);
  page.drawLine({ start: { x: x - l, y }, end: { x: x + l, y }, thickness: 0.6, color: rgb(0.4, 0.4, 0.4) });
  page.drawLine({ start: { x, y: y - l }, end: { x, y: y + l }, thickness: 0.6, color: rgb(0.4, 0.4, 0.4) });
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255
  };
}
