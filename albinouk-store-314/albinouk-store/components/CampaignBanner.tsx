import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Campaign } from "@/lib/types";

export default function CampaignBanner({ campaign }: { campaign: Campaign }) {
  return (
    <div className="banner-in relative overflow-hidden mx-4 md:mx-auto md:max-w-6xl mt-4 rounded-3xl"
      style={{
        background: campaign.banner_url
          ? `linear-gradient(0deg, rgba(0,0,0,0.55), rgba(0,0,0,0.35)), url(${campaign.banner_url}) center/cover no-repeat`
          : `linear-gradient(135deg, ${campaign.color}, #0a0a0a 120%)`,
      }}
    >
      <div className="relative z-10 px-6 py-12 md:py-16 text-center">
        <span className="text-4xl md:text-5xl inline-block mb-3">{campaign.emoji}</span>
        <h2 className="disp text-2xl md:text-4xl font-black mb-2 text-white drop-shadow">{campaign.name}</h2>
        {campaign.description && (
          <p className="text-sm md:text-base text-white/85 mb-6 max-w-lg mx-auto">{campaign.description}</p>
        )}
        <Link href="#campaign-products"
          className="btn-glow inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm disp"
          style={{ background: "#fff", color: "#0a0a0a" }}>
          تسوق الآن <ArrowRight size={16} className="rotate-180" />
        </Link>
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(60% 60% at 80% 20%, ${campaign.color}55, transparent 60%)` }} />
    </div>
  );
}
