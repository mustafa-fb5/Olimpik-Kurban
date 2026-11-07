"use client";

import { useState, type CSSProperties } from "react";
import { CheckCircle2 } from "lucide-react";
import { useSiteData, type Group } from "@/lib/site-data";
import { useReveal } from "@/hooks/use-reveal";

interface PricingSectionProps {
  onSelectGroup: () => void;
}

export function PricingSection({ onSelectGroup }: PricingSectionProps) {
  const { mainPageTexts: texts, groups } = useSiteData();
  const { ref, visible } = useReveal<HTMLElement>(0.15);

  return (
    <section
      ref={ref}
      className={`bg-slate-50 px-5 py-14 md:px-12 md:py-20 min-[1201px]:px-[120px] min-[1201px]:py-24 ${
        visible ? "is-visible" : ""
      }`}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="reveal-fade flex flex-col items-center text-center">
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-[13px] font-bold text-emerald-600">
            {texts.pricing_badge ?? "Fiyatlar"}
          </span>
          <h2 className="mt-4 text-[28px] font-extrabold tracking-[-0.5px] text-slate-900 md:text-[36px]">
            {texts.pricing_title ?? "Kurban Seçenekleri"}
          </h2>
          <p className="mt-3 max-w-[600px] text-[15px] leading-[1.6] text-slate-500 md:text-[17px]">
            {texts.pricing_subtitle ??
              "Her bütçeye uygun olarak belirlenmiş, özenle seçilmiş kurban gruplarımız."}
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-14 min-[901px]:grid-cols-4">
          {groups.map((g, i) => (
            <PricingCard
              key={g.id ?? i}
              group={g}
              index={i}
              onSelect={onSelectGroup}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  group,
  index,
  onSelect,
}: {
  group: Group;
  index: number;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isSoldOut = group.isSoldOut === true;
  const isPopular = group.isPopular === true;
  const delayMs = Math.round((0.2 + index * 0.1) * 1000);

  return (
    <div
      onMouseEnter={() => {
        if (!isSoldOut) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
      className={`reveal rounded-3xl bg-white p-7 transition-all duration-300 ${
        isSoldOut ? "cursor-not-allowed" : "cursor-pointer"
      } ${
        isSoldOut
          ? "border border-red-400/30"
          : hovered
            ? "border-2 border-emerald-500 shadow-[0_12px_30px_rgba(16,185,129,0.15)]"
            : isPopular
              ? "border-2 border-emerald-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
              : "border border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className={isSoldOut ? "opacity-60" : ""}>
        {/* Badge row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-extrabold text-slate-900">
            {group.name ?? ""}
          </span>
          {isSoldOut && (
            <span className="rounded-lg bg-red-500 px-2.5 py-1 text-[11px] font-extrabold text-white">
              DOLDU
            </span>
          )}
          {isPopular && (
            <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">
              Popüler
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-4 flex items-end gap-2 border-b border-slate-100 pb-5">
          <span
            className={`flex-1 text-[26px] leading-[1.1] font-black ${
              isSoldOut ? "text-slate-400" : "text-emerald-600"
            }`}
          >
            {group.price ?? ""}
          </span>
          <span className="text-[13px] font-medium text-slate-500">TL / Hisse</span>
        </div>

        {/* Features */}
        <div className="mt-5 space-y-3">
          {["İslami Usullere Uygun", "Eşit Paylı Hisse"].map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <CheckCircle2
                className={`h-[18px] w-[18px] shrink-0 ${
                  isSoldOut ? "text-slate-300" : "text-emerald-500"
                }`}
              />
              <span className="text-sm font-medium text-slate-600">{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-5">
          {isSoldOut ? (
            <div className="w-full rounded-[14px] bg-red-50 py-3.5 text-center text-sm font-bold text-red-400">
              Kayıtlar Kapandı
            </div>
          ) : (
            <button
              type="button"
              onClick={onSelect}
              className={`w-full cursor-pointer rounded-[14px] py-3.5 text-sm font-bold transition-all duration-250 ${
                isPopular
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                  : "bg-emerald-50 text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-emerald-500 hover:text-white hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
              }`}
            >
              Seç ve Kayıt Ol
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

