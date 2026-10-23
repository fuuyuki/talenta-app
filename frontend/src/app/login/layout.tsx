import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke dashboard Yayasan Talenta Insan Nusantara.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
