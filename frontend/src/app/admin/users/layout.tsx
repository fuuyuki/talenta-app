import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kelola Anggota",
};

export default function AdminUsersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
