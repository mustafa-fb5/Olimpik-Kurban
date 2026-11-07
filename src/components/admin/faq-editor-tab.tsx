"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSiteData, type Faq } from "@/lib/site-data";

export function FaqEditorTab({
  isMobile,
  isSmallPc,
}: {
  isMobile: boolean;
  isSmallPc: boolean;
}) {
  const service = useSiteData();

  const [tempFaqs, setTempFaqs] = useState<Faq[]>(() =>
    service.faqs.map((f) => ({ ...f })),
  );
  const [savingFaqs, setSavingFaqs] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    return service.subscribe(() => {
      if (!savingRef.current) {
        setTempFaqs(service.faqs.map((f) => ({ ...f })));
      }
    });
  }, [service]);

  const addFaq = () => {
    setTempFaqs((prev) => [
      ...prev,
      {
        question: "Yeni Soru?",
        answer: "Yeni cevap içeriği buraya yazılacaktır.",
      },
    ]);
  };

  const removeFaq = (idx: number) => {
    setTempFaqs((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateFaq = (idx: number, patch: Partial<Faq>) => {
    setTempFaqs((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    );
  };

  const saveFaqs = async () => {
    savingRef.current = true;
    setSavingFaqs(true);
    await service.updateFaqs(tempFaqs.map((f) => ({ ...f })));
    savingRef.current = false;
    setSavingFaqs(false);
    toast.success("SSS soruları başarıyla kaydedildi.");
  };

  return (
    <div
      style={{ padding: isMobile ? 12 : isSmallPc ? 16 : 32 }}
      className="min-h-0 flex-1 overflow-y-auto"
    >
      {isMobile ? (
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            SSS Yönetimi
          </h3>
          <p className="mt-1 text-[13px] text-slate-500">
            Sitedeki SSS soru ve cevaplarını düzenleyin.
          </p>
          <button
            type="button"
            onClick={addFaq}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#0F9F6E] py-3 text-sm font-semibold text-white hover:bg-[#0d8b60]"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni SSS Ekle</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Sıkça Sorulan Sorular (SSS) Yönetimi
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Sitedeki SSS accordion bölümündeki soru ve cevapları düzenleyin.
            </p>
          </div>
          <button
            type="button"
            onClick={addFaq}
            className="flex cursor-pointer items-center gap-2 rounded-[10px] bg-[#0F9F6E] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0d8b60]"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni SSS Ekle</span>
          </button>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        {tempFaqs.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-450">
            Herhangi bir SSS sorusu tanımlanmamış.
          </div>
        ) : (
          <div className="space-y-5">
            {tempFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F9F6E] text-xs font-bold text-white">
                    {idx + 1}
                  </div>
                  <Input
                    value={faq.question ?? ""}
                    onChange={(e) =>
                      updateFaq(idx, { question: e.target.value })
                    }
                    placeholder="Soru metni"
                    className="h-auto flex-1 border-0 bg-transparent p-0 text-sm font-bold text-slate-900 shadow-none focus-visible:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => removeFaq(idx)}
                    className="cursor-pointer rounded-lg p-1.5 text-red-400 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="my-2.5 h-px bg-slate-200" />

                <Textarea
                  rows={3}
                  value={faq.answer ?? ""}
                  onChange={(e) => updateFaq(idx, { answer: e.target.value })}
                  placeholder="Cevap metni"
                  className="min-h-0 resize-none border-0 bg-transparent p-0 text-sm text-slate-700 shadow-none focus-visible:ring-0"
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={savingFaqs}
          onClick={saveFaqs}
          className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#0F9F6E] text-sm font-bold text-white transition-colors hover:bg-[#0d8b60] disabled:opacity-50"
        >
          {savingFaqs ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <span>Tüm SSS Değişikliklerini Kaydet</span>
          )}
        </button>
      </div>
    </div>
  );
}

