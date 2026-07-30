export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full shrink-0 bg-white"
      style={{ width: size, height: size, boxShadow: "0 4px 18px -4px rgba(255,122,26,0.5)" }}
    >
      {/* حرف B البرتقالي مع رمز D-pad ونقاط التحكم — نفس الشعار الأصلي */}
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 100 120" fill="none">
        <path
          d="M20 5 H55 C72 5 82 15 82 30 C82 40 76 47 68 50 C78 53 85 61 85 73 C85 90 73 100 55 100 H20 Z"
          fill="#ff7a1a"
        />
        {/* D-pad */}
        <path
          d="M38 58 h8 v-8 h6 v8 h8 v6 h-8 v8 h-6 v-8 h-8 z"
          fill="white"
        />
        {/* أزرار دائرية */}
        <circle cx="66" cy="55" r="4" fill="white" />
        <circle cx="58" cy="63" r="4" fill="white" />
        <circle cx="66" cy="71" r="4" fill="white" />
        <circle cx="74" cy="63" r="4" fill="white" />
      </svg>
    </div>
  );
}
