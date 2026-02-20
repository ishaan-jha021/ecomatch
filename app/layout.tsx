import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClientShell } from "@/components/client-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ecomatch — Find Verified Startup Spaces in India",
  description: "Discover verified incubators and co-working spaces across India. Real data, real photos, real reviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, "font-sans antialiased bg-white text-gray-900")}>
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
