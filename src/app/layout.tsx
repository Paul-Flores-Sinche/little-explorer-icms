import type { Metadata } from "next";
import { Baloo_2, Manrope } from "next/font/google";

import { EnquiryProvider } from "@/components/shared/enquiry-store";

import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Little Explorer ICMS",
  description:
    "Interactive demo of the Little Explorer Early Learning Centre Integrated Childcare Management System.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${baloo.variable} ${manrope.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <EnquiryProvider>{children}</EnquiryProvider>
      </body>
    </html>
  );
}
