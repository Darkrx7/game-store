import Image from "next/image";
import { getIcon } from "./icon-map";

export default function ProductArt({
  image, iconName = "Gamepad2", badge, className = "",
}: { image?: string | null; iconName?: string; badge?: string | null; className?: string }) {
  const Icon = getIcon(iconName);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-[#0a0a0a] ${className}`}>
      {image ? (
        <Image src={image} alt="" fill className="object-cover" />
      ) : (
        <>
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "linear-gradient(135deg, transparent 45%, rgba(255,122,26,0.25) 50%, transparent 55%)" }}
          />
          <Icon size="38%" color="#ff7a1a" strokeWidth={1.2} />
        </>
      )}
      {badge && (
        <span
          className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full text-black"
          style={{ background: badge === "عرض" ? "#ff3b30" : "#ff7a1a" }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
