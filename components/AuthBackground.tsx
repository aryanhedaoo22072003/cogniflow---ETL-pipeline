"use client";

export default function AuthBackground({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1220] via-[#0E0F1A] to-[#161829] overflow-hidden py-12">
      <svg className="absolute inset-0 w-full h-full opacity-[0.15]" preserveAspectRatio="none">
        <defs>
          <pattern id="authGrid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#3A4F8A" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#authGrid)" />
      </svg>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="none">
        {[
          "M0,140 C200,80 350,220 550,160 S850,60 1000,140",
          "M0,380 C220,440 380,300 580,360 S820,480 1000,400",
          "M0,560 C240,600 400,500 600,540 S840,620 1000,560",
        ].map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#8B7FFF" strokeWidth="1.2" opacity={0.3 - i * 0.05} />
        ))}
        {[
          { cx: 90, cy: 140 }, { cx: 550, cy: 160 }, { cx: 950, cy: 140 },
          { cx: 220, cy: 440 }, { cx: 580, cy: 360 }, { cx: 900, cy: 400 },
          { cx: 400, cy: 500 }, { cx: 780, cy: 600 }, { cx: 130, cy: 600 },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r="3.5" fill="#5EEAD4" opacity="0.55">
            <animate attributeName="opacity" values="0.15;0.65;0.15" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" begin={`${i * 0.35}s`} />
          </circle>
        ))}
      </svg>

      <div className="absolute top-8 left-8 flex items-center gap-2 font-bold text-[17px] text-white" style={{ fontFamily: "'Space Grotesk'" }}>
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#8B7FFF] to-[#5B9CF6]" />
        CogniFlow
      </div>

      <div className="relative z-10 animate-fade-up w-full max-w-[400px] px-4">
        <div className="text-center mb-6">
          <h1 className="text-white text-[24px] font-semibold mb-1.5" style={{ fontFamily: "'Space Grotesk'" }}>
            {title}
          </h1>
          <p className="text-[#8B8FB0] text-[13.5px]">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}