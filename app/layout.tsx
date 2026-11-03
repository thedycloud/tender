import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import {
  BarChart3,
  Bell,
  ChevronRight,
  FileText,
  Folder,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Users,
} from "lucide-react";
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
  title: "TenderPro",
  description: "Dashboard pengelolaan tender dan dokumen",
};

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tender Lelang", href: "/dashboard", icon: FileText, active: true },
  { label: "Dokumen", href: "/dashboard?tab=dokumen", icon: Folder },
  { label: "Vendor", href: "/dashboard?v=vendor", icon: Users },
  { label: "Laporan", href: "/dashboard?tab=laporan", icon: BarChart3 },
  { label: "Pengaturan", href: "/dashboard?tab=pengaturan", icon: Settings },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <QueryProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-[#f7f8fb] text-zinc-950">
              <aside className="fixed inset-y-0 left-0 z-40 hidden w-[180px] border-r border-zinc-200 bg-white lg:block">
                <div className="flex h-[60px] items-center gap-2 border-b border-zinc-200 px-[12px]">
                  <div className="grid size-8 place-items-center rounded-lg bg-[#4f46e5] text-sm font-bold text-white">
                    T
                  </div>
                  <span className="text-[16px] font-bold tracking-tight">TenderPro</span>
                  <button className="ml-auto grid size-8 place-items-center rounded-md border border-zinc-200 text-zinc-600" aria-label="Menu">
                    <Menu className="size-4" />
                  </button>
                </div>
                <nav className="space-y-1 px-3 py-3" aria-label="Navigasi utama">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        className={`flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] ${
                          item.active
                            ? "bg-[#eef0ff] font-semibold text-[#4b4ce8]"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        <Icon className="size-[17px]" />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </nav>
              </aside>

              <div className="lg:pl-[180px]">
                <header className="sticky top-0 z-30 flex h-[60px] items-center border-b border-zinc-200 bg-white/95 px-5 backdrop-blur lg:px-7">
                  <button className="mr-3 grid size-8 place-items-center rounded-md border border-zinc-200 lg:hidden" aria-label="Menu">
                    <Menu className="size-4" />
                  </button>
                  <div className="hidden items-center text-xs text-zinc-500 sm:flex">
                    <span>Dashboard</span>
                    <ChevronRight className="mx-2 size-3" />
                    <span>Tender Lelang</span>
                    <ChevronRight className="mx-2 size-3" />
                    <span className="text-zinc-800">Daftar Dokumen</span>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <label className="hidden h-9 w-[260px] items-center gap-2 rounded-md border border-zinc-200 px-3 text-zinc-400 xl:flex">
                      <Search className="size-3.5" />
                      <input className="min-w-0 flex-1 bg-transparent text-xs text-zinc-700 outline-none" placeholder="Cari di TenderPro..." />
                      <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-500">&#8984;K</kbd>
                    </label>
                    <button className="relative grid size-9 place-items-center rounded-full border border-zinc-200" aria-label="Notifikasi">
                      <Bell className="size-[15px]" />
                      <span className="absolute right-[-2px] top-[-2px] grid size-3.5 place-items-center rounded-full bg-red-500 text-[8px] text-white ring-2 ring-white">3</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="grid size-9 place-items-center rounded-full bg-[#dfe7ff] text-xs font-bold text-[#4259b4]">DR</div>
                      <div className="hidden leading-tight sm:block">
                        <p className="text-xs font-semibold">Dewi Rahmawati</p>
                        <p className="mt-0.5 text-[10px] text-zinc-500">Panitia Pengadaan</p>
                      </div>
                    </div>
                  </div>
                </header>
                {children}
              </div>
            </div>
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
