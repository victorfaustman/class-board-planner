import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Генератор оформления класса",
  description: "Создание настенных композиций и печать плитками A4"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
