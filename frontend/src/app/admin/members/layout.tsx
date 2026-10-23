import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Data Anggota",
};

export default function AdminMembersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
