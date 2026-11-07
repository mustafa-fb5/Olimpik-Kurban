"use client";

import { useState, type CSSProperties } from "react";
import { Scale, Shield, Truck, type LucideIcon } from "lucide-react";
import { useSiteData } from "@/lib/site-data";
import { useReveal } from "@/hooks/use-reveal";

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  c0: string;
  c1: string;
  rgb0: string;
}

export function FeaturesSection() {
  const { mainPageTexts: texts } = useSiteData();
  const { ref, visible } = useReveal<HTMLElement>(0.2);

  const features: FeatureItem[] = [
    {
      icon: Shield,
      title: texts.feature_1_title ?? "Güvenli ve Şeffaf",
      description:
        texts.feature_1_desc ??
        "Kurbanlıklarımız veteriner hekim kontrolünde seçilir. Tüm süreçte sizinle şeffaf bir iletişim kurulur.",
      c0: "#10B981",
      c1: "#059669",
      rgb0: "16, 185, 129",
    },
    {
      icon: Scale,
      title: texts.feature_2_title ?? "İslami Usul Kesim",
      description:
        texts.feature_2_desc ??
        "Tekbirlerle, İslami kaidelere tam riayet edilerek, işin ehli kasaplarımız tarafından kesim yapılır.",
      c0: "#3B82F6",
      c1: "#2563EB",
      rgb0: "59, 130, 246",
    },
    {
      icon: Truck,
      title: texts.feature_3_title ?? "Eşit Paylama & Teslim",
      description:
        texts.feature_3_desc ??
        "Etleriniz hassas terazilerde eşit olarak pay edilir, özel ambalajlarında ilk gün teslim edilir.",
      c0: "#F59E0B",
      c1: "#D97706",
      rgb0: "245, 158, 11",
    },
  ];

  return (
    <section
      ref={ref}
      className={`bg-white px-5 py-14 md:px-12 md:py-20 min-[1201px]:px-[120px] min-[1201px]:py-24 ${
        visible ? "is-visible" : ""
      }`}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Section Header */}
        <div className="reveal-fade flex flex-col items-center text-center">
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-[13px] font-bold text-emerald-600">
            {texts.features_badge ?? "Neden Biz?"}
          </span>
          <h2 className="mt-4 text-[28px] font-extrabold tracking-[-0.5px] text-slate-900 md:text-[36px]">
            {texts.features_title ?? "Neden Olimpik Kurban?"}
          </h2>
          <p className="mt-3 max-w-[600px] text-[15px] leading-[1.6] text-slate-500 md:text-[17px]">
            {texts.features_subtitle ??
              "İbadetinizi en doğru, şeffaf ve güvenilir şekilde yerine getirmeniz için tüm süreci titizlikle yönetiyoruz."}
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:mt-16 min-[801px]:grid-cols-3 min-[801px]:gap-6">
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;
  const delayMs = Math.round((0.2 + index * 0.15) * 800);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={
        {
          "--reveal-delay": `${delayMs}ms`,
          borderColor: hovered ? `rgba(${feature.rgb0}, 0.3)` : "#F1F5F9",
          boxShadow: hovered
            ? `0 12px 32px rgba(${feature.rgb0}, 0.12)`
            : "0 4px 16px rgba(0, 0, 0, 0.04)",
        } as CSSProperties
      }
      className="reveal cursor-pointer rounded-3xl border bg-white p-8 transition-[border-color,box-shadow] duration-300"
    >
      <div
        style={{
          backgroundImage: hovered
            ? `linear-gradient(135deg, ${feature.c0}, ${feature.c1})`
            : `linear-gradient(135deg, ${feature.c0}1A, ${feature.c1}1A)`,
        }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300"
      >
        <Icon
          className="h-[26px] w-[26px] transition-colors duration-300"
          style={{ color: hovered ? "#FFFFFF" : feature.c0 }}
        />
      </div>
      <h3 className="mt-6 text-xl font-bold text-slate-900">{feature.title}</h3>
      <p className="mt-3 text-[15px] leading-[1.7] text-slate-500">
        {feature.description}
      </p>
    </div>
  );
}

