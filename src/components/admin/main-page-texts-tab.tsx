"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSiteData, type MainPageTexts } from "@/lib/site-data";

export function MainPageTextsTab({
  isMobile,
  isSmallPc,
}: {
  isMobile: boolean;
  isSmallPc: boolean;
}) {
  const service = useSiteData();

  const [texts, setTexts] = useState<MainPageTexts>(() => ({
    ...service.mainPageTexts,
  }));
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    return service.subscribe(() => {
      if (!savingRef.current) {
        setTexts({ ...service.mainPageTexts });
      }
    });
  }, [service]);

  const setField = (key: string, val: string) => {
    setTexts((prev) => ({ ...prev, [key]: val }));
  };

  const saveMainPageTexts = async () => {
    savingRef.current = true;
    setSaving(true);
    await service.updateMainPageTexts({ ...texts });
    savingRef.current = false;
    setSaving(false);
    toast.success("Ana sayfa yazıları başarıyla kaydedildi.");
  };

  const renderField = (key: string, label: string, maxLines = 1) => (
    <div key={key} className="mb-5">
      <label className="text-[13px] font-semibold text-slate-600">
        {label}
      </label>
      <div className="mt-2">
        {maxLines > 1 ? (
          <Textarea
            rows={maxLines}
            value={texts[key] ?? ""}
            onChange={(e) => setField(key, e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm shadow-none"
          />
        ) : (
          <Input
            value={texts[key] ?? ""}
            onChange={(e) => setField(key, e.target.value)}
            className="h-auto rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm shadow-none"
          />
        )}
      </div>
    </div>
  );

  return (
    <div
      style={{ padding: isMobile ? 12 : isSmallPc ? 16 : 32 }}
      className="min-h-0 flex-1 overflow-y-auto"
    >
      {isMobile ? (
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Yazı Yönetimi
          </h3>
          <p className="mt-1 text-[13px] text-slate-500">
            Ana ekrandaki metinleri düzenleyin.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={saveMainPageTexts}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#0F9F6E] py-3 text-[13px] font-semibold text-white hover:bg-[#0d8b60] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin text-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Ana Sayfa Yazı Yönetimi
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Ana ekranda bulunan tüm metin alanlarını buradan
              güncelleyebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={saveMainPageTexts}
            className="flex cursor-pointer items-center gap-2 rounded-[10px] bg-[#0F9F6E] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#0d8b60] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin text-white" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>Tüm Değişiklikleri Kaydet</span>
          </button>
        </div>
      )}

      <div className="mt-8 space-y-6">
        <TextsGroupCard title="1. Giriş (Hero) Bölümü">
          {renderField("hero_badge", "Rozet (Badge) Metni")}
          {renderField(
            "hero_title",
            "Ana Başlık (Satır atlamak için \\n kullanabilirsiniz)",
            2,
          )}
          {renderField("hero_subtitle", "Alt Başlık", 3)}
          {isMobile ? (
            <div>
              {renderField("hero_btn_register", "1. Buton Yazısı (Kayıt)")}
              {renderField("hero_btn_search", "2. Buton Yazısı (Sorgula)")}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {renderField("hero_btn_register", "1. Buton Yazısı (Kayıt)")}
              {renderField("hero_btn_search", "2. Buton Yazısı (Sorgula)")}
            </div>
          )}
        </TextsGroupCard>

        <TextsGroupCard title="2. Özellikler (Neden Biz) Bölümü">
          {renderField("features_badge", "Bölüm Rozeti")}
          {renderField("features_title", "Bölüm Başlığı")}
          {renderField("features_subtitle", "Bölüm Açıklaması", 2)}
          <div className="my-4 h-px bg-slate-200" />
          <div className="mb-3 font-bold text-slate-700">
            Özellik 1 (Sol Kart)
          </div>
          {renderField("feature_1_title", "Başlık")}
          {renderField("feature_1_desc", "Açıklama", 2)}
          <div className="my-4 h-px bg-slate-200" />
          <div className="mb-3 font-bold text-slate-700">
            Özellik 2 (Orta Kart)
          </div>
          {renderField("feature_2_title", "Başlık")}
          {renderField("feature_2_desc", "Açıklama", 2)}
          <div className="my-4 h-px bg-slate-200" />
          <div className="mb-3 font-bold text-slate-700">
            Özellik 3 (Sağ Kart)
          </div>
          {renderField("feature_3_title", "Başlık")}
          {renderField("feature_3_desc", "Açıklama", 2)}
        </TextsGroupCard>

        <TextsGroupCard title="3. Kurban Sorgulama Bölümü">
          {renderField("search_title", "Bölüm Başlığı")}
          {renderField("search_subtitle", "Bölüm Açıklaması", 2)}
          {renderField(
            "search_placeholder",
            "Girdi Kutusu İpucu (Placeholder)",
          )}
          {renderField("search_btn", "Buton Metni")}
          {renderField(
            "search_error",
            "Sonucu Bulunamadı Uyarı Metni",
            2,
          )}
        </TextsGroupCard>

        <TextsGroupCard title="4. Fiyatlar (Grup Seçenekleri) Bölümü">
          {renderField("pricing_badge", "Bölüm Rozeti")}
          {renderField("pricing_title", "Bölüm Başlığı")}
          {renderField("pricing_subtitle", "Bölüm Açıklaması", 2)}
        </TextsGroupCard>

        <TextsGroupCard title="5. Kayıt Formu Bölümü">
          {renderField("reg_title", "Normal Kayıt Başlığı")}
          {renderField("reg_subtitle", "Normal Kayıt Açıklaması", 2)}
          {renderField("reg_donation_title", "Bağış Kaydı Başlığı")}
          {renderField("reg_donation_subtitle", "Bağış Kaydı Açıklaması", 2)}
          <div className="my-4 h-px bg-slate-200" />
          <div className="mb-3 font-bold text-slate-700">
            Kayıt Sonrası Başarı Ekranı
          </div>
          {renderField("reg_success_title", "Başarı Başlığı")}
          {renderField("reg_success_desc", "Başarı Açıklaması", 2)}
        </TextsGroupCard>

        <TextsGroupCard title="6. SSS Bölümü Üst Metinleri">
          {renderField("faq_badge", "Bölüm Rozeti")}
          {renderField("faq_title", "Bölüm Başlığı")}
          {renderField("faq_subtitle", "Bölüm Açıklaması", 2)}
        </TextsGroupCard>

        <button
          type="button"
          disabled={saving}
          onClick={saveMainPageTexts}
          className="mt-2 flex h-[52px] w-full cursor-pointer items-center justify-center rounded-xl bg-[#0F9F6E] text-base font-bold text-white transition-colors hover:bg-[#0d8b60] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <span>Tüm Yazı Değişikliklerini Kaydet</span>
          )}
        </button>
      </div>
    </div>
  );
}

function TextsGroupCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-7">
      <h4 className="mb-6 text-lg font-bold text-slate-800">{title}</h4>
      {children}
    </div>
  );
}

