"use client";

import { useMemo, useState } from "react";
import { calcTiling, getVariants, sanitizeInput, type GeneratorInput } from "@/lib/generator";

const initial: GeneratorInput = {
  wallWidthCm: 300,
  wallHeightCm: 120,
  theme: "Весна",
  holiday: "Последний звонок",
  ageGroup: "5-9",
  printMode: "color",
  marginMm: 5,
  overlapMm: 3
};

export default function HomePage() {
  const [input, setInput] = useState<GeneratorInput>(initial);
  const valid = sanitizeInput(input);
  const variants = useMemo(() => getVariants(valid), [valid]);
  const [selectedId, setSelectedId] = useState(variants[0].id);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const tiling = calcTiling(valid);

  return (
    <main>
      <h1 style={{ fontSize: 32, margin: "4px 0 16px" }}>Генератор оформления класса/доски</h1>
      <p style={{ marginTop: 0, marginBottom: 24, opacity: 0.85 }}>
        Введите параметры стены, получите композицию и точный расчет листов A4 с раскладкой по плиткам.
      </p>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>1) Параметры</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <Field label="Ширина стены (см)">
            <input type="number" value={input.wallWidthCm} onChange={(e) => setInput({ ...input, wallWidthCm: Number(e.target.value) })} />
          </Field>
          <Field label="Высота стены (см)">
            <input type="number" value={input.wallHeightCm} onChange={(e) => setInput({ ...input, wallHeightCm: Number(e.target.value) })} />
          </Field>
          <Field label="Тема">
            <input value={input.theme} onChange={(e) => setInput({ ...input, theme: e.target.value })} />
          </Field>
          <Field label="Праздник/мероприятие">
            <input value={input.holiday} onChange={(e) => setInput({ ...input, holiday: e.target.value })} />
          </Field>
          <Field label="Возраст">
            <select value={input.ageGroup} onChange={(e) => setInput({ ...input, ageGroup: e.target.value as GeneratorInput["ageGroup"] })}>
              <option value="1-4">1-4 класс</option>
              <option value="5-9">5-9 класс</option>
              <option value="10-11">10-11 класс</option>
            </select>
          </Field>
          <Field label="Режим оформления">
            <select value={input.printMode} onChange={(e) => setInput({ ...input, printMode: e.target.value as GeneratorInput["printMode"] })}>
              <option value="color">Цветное</option>
              <option value="bw">Минимум цвета</option>
            </select>
          </Field>
          <Field label="Тех. поля (мм)">
            <input type="number" value={input.marginMm} onChange={(e) => setInput({ ...input, marginMm: Number(e.target.value) })} />
          </Field>
          <Field label="Нахлест (мм)">
            <input type="number" value={input.overlapMm} onChange={(e) => setInput({ ...input, overlapMm: Number(e.target.value) })} />
          </Field>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>2) Варианты композиции</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {variants.map((v) => (
            <button
              key={v.id}
              className="secondary"
              style={{
                textAlign: "left",
                border: selectedId === v.id ? `2px solid ${v.accent}` : "2px solid transparent",
                background: `linear-gradient(145deg, ${v.bgA}, ${v.bgB})`,
                minHeight: 120
              }}
              onClick={() => setSelectedId(v.id)}
            >
              <div style={{ fontSize: 16 }}>{v.name}</div>
              <div style={{ fontSize: 13, marginTop: 8, opacity: 0.9 }}>{v.headline}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>3) Итоговый расчет</h2>
        <p style={{ marginTop: 0 }}>
          Нужно листов A4: <strong>{tiling.sheets}</strong> ({tiling.cols} x {tiling.rows})
        </p>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          Размер стены: {tiling.wallWmm} x {tiling.wallHmm} мм. Рабочая зона одного листа: {tiling.tileW.toFixed(1)} x {tiling.tileH.toFixed(1)} мм.
        </p>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>4) Раскладка плиток</h2>
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          Нумерация идет слева направо и сверху вниз.
        </p>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${tiling.cols}, minmax(36px, 1fr))`,
            gap: 6
          }}
        >
          {Array.from({ length: tiling.sheets }).map((_, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "8px 4px",
                textAlign: "center",
                fontSize: 12,
                background: selected.bgA
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  );
}
