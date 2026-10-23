import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kelola Akun",
};

export default function AdminUsersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
