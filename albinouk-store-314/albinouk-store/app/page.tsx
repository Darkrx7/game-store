import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/Hero";
import CampaignBanner from "@/components/CampaignBanner";
import { ProductGrid } from "@/components/ProductCard";
import { getIcon } from "@/components/icon-map";

export const revalidate = 30;

export default async function HomePage() {
  const supabase = createClient();

  const nowIso = new Date().toISOString();

  const [{ data: categories }, { data: latest }, { data: offers }, { data: bestSellers }, { data: activeCampaigns }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("products").select("*").eq("show_on_home", true).order("created_at", { ascending: false }).limit(4),
      supabase.from("products").select("*").eq("offer_enabled", true).limit(8),
      supabase.from("products").select("*").eq("show_bestseller", true).limit(8),
      supabase.from("campaigns").select("*").eq("active", true).lte("starts_at", nowIso).gte("ends_at", nowIso).limit(1),
    ]);

  const campaign = activeCampaigns?.[0] || null;

  let campaignProducts: any[] = [];
  if (campaign) {
    const { data: links } = await supabase.from("campaign_products").select("product_id").eq("campaign_id", campaign.id);
    const ids = (links || []).map((l) => l.product_id);
    if (ids.length) {
      const { data } = await supabase.from("products").select("*").in("id", ids);
      campaignProducts = data || [];
    }
  }

  return (
    <main>
      <Hero />

      {campaign && (
        <>
          <CampaignBanner campaign={campaign} />
          <div id="campaign-products">
            <Section title={`منتجات ${campaign.name}`} subtitle="بس لفترة الحملة">
              <ProductGrid products={campaignProducts} />
            </Section>
          </div>
        </>
      )}

      <Section title="الأقسام" subtitle="دور بسرعة على اللي تريده">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {(categories || []).map((c, i) => {
            const Icon = getIcon(c.icon);
            return (
              <Link key={c.id} href={`/category/${c.id}`}
                className="fade-up flex flex-col items-center gap-2 p-4 rounded-2xl card-hover bg-brand-card border border-brand-border"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-orange/10">
                  <Icon size={22} color="#ff7a1a" />
                </div>
                <span className="text-xs font-bold text-center">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section title="أحدث المنتجات" subtitle="وصلنا حديثاً">
        <ProductGrid products={latest || []} />
      </Section>

      <Section title="🔥 العروض" subtitle="خصومات لفترة محدودة" accent>
        <ProductGrid products={offers || []} />
      </Section>

      <Section title="⭐ الأكثر مبيعاً" subtitle="اختيار الزبائن">
        <ProductGrid products={bestSellers || []} />
      </Section>
    </main>
  );
}

function Section({ title, subtitle, children, accent }: any) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-5">
        <h2 className={`disp text-xl md:text-2xl font-black ${accent ? "text-brand-orange" : ""}`}>{title}</h2>
        <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}
