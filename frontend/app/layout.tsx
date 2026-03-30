import { AppShell } from "@/components/app-shell";
import { Providers } from "@/app/providers";

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="font-[var(--font-manrope)]">
        <AppShell>{children}</AppShell>
      </div>
    </Providers>
  );
}
