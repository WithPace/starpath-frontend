import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StarPath Frontend",
  description: "StarPath multi-role frontend workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
