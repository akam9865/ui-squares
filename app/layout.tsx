import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Bowl Squares",
  description: "Super Bowl Squares Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
