import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STAR S.H.I.P - Login Page",
  description: "STAR SMS Hub for Information Processing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}