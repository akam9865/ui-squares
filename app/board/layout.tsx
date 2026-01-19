"use client";

import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
