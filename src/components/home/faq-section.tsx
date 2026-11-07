"use client";

import { useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { useSiteData } from "@/lib/site-data";
import { useReveal } from "@/hooks/use-reveal";

export function FaqSection() {
  const { mainPageTexts: texts, faqs } = useSiteData();
  const { ref, visible } = useReveal<HTMLElement>(0.2);

  return (
    <section
      ref={ref}
      className={`bg-white px-5 py-14 md:px-12 md:py-20 min-[1201px]:px-[120px] min-[1201px]:py-24 ${
        visible ? "is-visible" : ""
      }`}
    >
      <div className="mx-auto max-w-[800px]">
        {/* Header */}
        <div className="reveal-fade flex flex-col items-center text-center">
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-[13px] font-bold text-emerald-600">
            {texts.faq_badge ?? "SSS"}
          </span>
          <h2 className="mt-4 text-[28px] font-extrabold tracking-[-0.5px] text-slate-900 md:text-[36px]">
            {texts.faq_title ?? "Sıkça Sorulan Sorular"}
          </h2>
          <p className="mt-3 text-[15px] text-slate-500 md:text-[17px]">
            {texts.faq_subtitle ?? "Aklınıza takılan soruların cevapları"}
          </p>
        </div>

        {/* FAQ items */}
        <div className="mt-8 space-y-3 md:mt-12">
          {faqs.map((faq, idx) => {
            const delayMs = Math.round(Math.min(1, 0.2 + idx * 0.1) * 800);
            return (
              <div
                key={idx}
                style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
                className="reveal"
              >
                <FaqItem
                  question={faq.question ?? ""}
                  answer={faq.answer ?? ""}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      className={`cursor-pointer rounded-[18px] border transition-colors duration-300 ${
        expanded
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3 p-5">
        <span
          className={`flex-1 text-base font-semibold transition-colors ${
            expanded ? "text-emerald-700" : "text-slate-800"
          }`}
        >
          {question}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-all duration-300 ${
            expanded
              ? "rotate-180 bg-emerald-600 text-white"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          <ChevronDown className="h-5 w-5" />
        </span>
      </div>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-[15px] leading-[1.7] text-slate-600">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

