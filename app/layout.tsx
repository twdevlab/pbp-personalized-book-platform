import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personalized Book Prototype",
  description: "MVP prototype for personalized book generation"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
