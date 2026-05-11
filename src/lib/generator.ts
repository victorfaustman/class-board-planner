export type GeneratorInput = {
  wallWidthCm: number;
  wallHeightCm: number;
  theme: string;
  holiday: string;
  ageGroup: "1-4" | "5-9" | "10-11";
  printMode: "color" | "bw";
  marginMm: number;
  overlapMm: number;
};

export type LayoutVariant = {
  id: string;
  name: string;
  headline: string;
  accent: string;
  bgA: string;
  bgB: string;
};

export const A4_MM = { width: 210, height: 297 };

export function sanitizeInput(input: GeneratorInput): GeneratorInput {
  return {
    ...input,
    wallWidthCm: Math.max(30, input.wallWidthCm),
    wallHeightCm: Math.max(30, input.wallHeightCm),
    marginMm: Math.max(0, Math.min(20, input.marginMm)),
    overlapMm: Math.max(0, Math.min(15, input.overlapMm))
  };
}

export function getVariants(input: GeneratorInput): LayoutVariant[] {
  const headline = `${input.holiday}: ${input.theme}`;
  return [
    {
      id: "center",
      name: "Центр + рамка",
      headline,
      accent: "#ea580c",
      bgA: "#fff7ed",
      bgB: "#ffedd5"
    },
    {
      id: "bands",
      name: "Горизонтальные ленты",
      headline,
      accent: "#0f766e",
      bgA: "#f0fdfa",
      bgB: "#ccfbf1"
    },
    {
      id: "diagonal",
      name: "Диагональная динамика",
      headline,
      accent: "#1d4ed8",
      bgA: "#eff6ff",
      bgB: "#dbeafe"
    }
  ];
}

export function calcTiling(input: GeneratorInput) {
  const wallWmm = input.wallWidthCm * 10;
  const wallHmm = input.wallHeightCm * 10;
  const tileW = A4_MM.width - input.marginMm * 2 - input.overlapMm;
  const tileH = A4_MM.height - input.marginMm * 2 - input.overlapMm;
  const cols = Math.max(1, Math.ceil(wallWmm / tileW));
  const rows = Math.max(1, Math.ceil(wallHmm / tileH));
  return {
    cols,
    rows,
    sheets: cols * rows,
    tileW,
    tileH,
    wallWmm,
    wallHmm
  };
}
