import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Yayasan Talenta Insan Nusantara",
    template: "%s | Talenta",
  },
  description:
    "Yayasan Talenta Insan Nusantara mendampingi mahasiswa dan talenta muda melalui pembinaan karakter, talent upgrading, dan mentorship yang memadukan nilai Islam dengan kompetensi profesional.",
  applicationName: "Talenta Insan Nusantara",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
