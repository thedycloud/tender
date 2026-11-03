import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f8f9fc] px-4 py-6 sm:px-6 lg:px-7">
      <div className="mx-auto w-full max-w-[1120px]">{children}</div>
    </main>
  );
}
