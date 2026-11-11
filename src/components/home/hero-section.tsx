"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { useSiteData } from "@/lib/site-data";

interface HeroSectionProps {
  onKayitTap: () => void;
  onSorgulaTap: () => void;
}

const GRID_SVG =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==";

export function HeroSection({ onKayitTap, onSorgulaTap }: HeroSectionProps) {
  const { mainPageTexts: texts } = useSiteData();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const title = (texts.hero_title ?? "Kurbanınız\nEmin Ellerde").replace(/\\n/g, "\n");

  return (
    <section className="relative flex min-h-[650px] items-center justify-center overflow-hidden md:h-screen md:min-h-[700px]">
      {/* Background Image (Statik Büyükbaş Kurban Görseli) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-cattle.jpg')",
        }}
      />

      {/* Dark & Emerald Overlay (Okunabilirlik ve kurumsal ton için) */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/75 to-emerald-950/80" />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `url("${GRID_SVG}")`, backgroundRepeat: "repeat" }}
      />

      {/* Bottom gradient fade */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-[200px]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(248, 250, 252, 0.8) 50%, #F8FAFC 100%)",
        }}
      />

      {/* Content */}
      <div
        className={`relative z-10 mx-auto flex max-w-[900px] flex-col items-center px-6 text-center transition-all duration-[1200ms] ease-out md:px-12 ${
          entered ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
        }`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-badge-pulse" />
          <span className="text-sm font-semibold text-white">
            {texts.hero_badge ?? ""}
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-7 whitespace-pre-line text-[38px] leading-[1.08] font-black tracking-[-1.5px] text-white md:text-[64px]">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-[680px] text-[15px] leading-[1.6] font-light text-white/75 md:text-[20px]">
          {texts.hero_subtitle ??
            "İslami usullere uygun, hijyenik tesislerde, veteriner hekim kontrolünde güvenilir bir kurban ibadeti için hizmetinizdeyiz."}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          <button
            type="button"
            onClick={onKayitTap}
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-[18px] text-base font-bold text-white transition-all duration-250 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)]"
          >
            <CheckCircle2 className="h-5 w-5 text-white" />
            <span>{texts.hero_btn_register ?? "Hemen Kayıt Ol"}</span>
          </button>

          <button
            type="button"
            onClick={onSorgulaTap}
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/30 bg-white/10 px-8 py-[18px] text-base font-bold text-white transition-all duration-250 hover:bg-white/20"
          >
            <Search className="h-5 w-5 text-white" />
            <span>{texts.hero_btn_search ?? "Kurbanını Gör"}</span>
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`pointer-events-none absolute right-0 bottom-10 left-0 hidden justify-center transition-opacity duration-[1200ms] min-[750px]:flex ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="animate-scroll-bob">
          <div className="flex h-11 w-7 justify-center rounded-[14px] border-2 border-white/40">
            <div className="mt-2 h-2.5 w-1 rounded-sm bg-white/60" />
          </div>
        </div>
      </div>
    </section>
  );
}

