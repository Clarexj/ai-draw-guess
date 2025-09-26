import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI你画我猜 | AI Draw & Guess",
  description: "在画布上作画，让AI猜你画的是什么 | Draw and let AI guess what you drew",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}