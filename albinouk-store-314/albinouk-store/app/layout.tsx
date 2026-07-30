import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "مركز البنوك للألعاب",
  description: "وجهتك الأولى لمستلزمات الألعاب في بغداد",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: settings } = await supabase.from("store_settings").select("*").single();

  return (
    <html dir="rtl" lang="ar">
      <body>
        <StoreProvider>
          <Header settings={settings} />
          {children}
          <Footer settings={settings} />
        </StoreProvider>
      </body>
    </html>
  );
}
