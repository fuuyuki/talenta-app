import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Administrasi",
  description: "Panel administrasi Yayasan Talenta Insan Nusantara.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
