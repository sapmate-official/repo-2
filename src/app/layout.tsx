import type { Metadata } from "next";
import "./globals.css";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  title: "Alkaa Business + | Course Admissions & Accounting",
  description: "Course Admissions & Smart Accounting Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
