import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SupportChat } from "@/components/support/SupportChat";
import "./globals.scss";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WeDoHalal Wholesale — Bulk Halal Meat Delivery Edmonton",
  description:
    "WeDoHalal Wholesale supplies restaurants, grocery stores, mosques, and catering companies across Edmonton and Alberta with certified halal meat in bulk.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <SupportChat />
      </body>
    </html>
  );
}
