"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useSiteData, type Group } from "@/lib/site-data";

export function SiteConfigTab({
  isMobile,
  isSmallPc,
}: {
  isMobile: boolean;
  isSmallPc: boolean;
}) {
  const service = useSiteData();

  const [phone, setPhone] = useState(service.contactPhone);
  const [address, setAddress] = useState(service.contactAddress);
  const [adminUser, setAdminUser] = useState(service.adminUsername);
  const [adminPass, setAdminPass] = useState(service.adminPassword);
  const [tempGroups, setTempGroups] = useState<Group[]>(() =>
    service.groups.map((g) => ({ ...g })),
  );
  const [savingConfig, setSavingConfig] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    return service.subscribe(() => {
      if (!savingRef.current) {
        setPhone(service.contactPhone);
        setAddress(service.contactAddress);
        setAdminUser(service.adminUsername);
        setAdminPass(service.adminPassword);
        setTempGroups(service.groups.map((g) => ({ ...g })));
      }
    });
  }, [service]);

  const saveConfig = async () => {
    savingRef.current = true;
    setSavingConfig(true);
    await service.updateConfig({
      phone: phone.trim(),
      address: address.trim(),
      username: adminUser.trim(),
      password: adminPass.trim(),
      newGroups: tempGroups.map((g) => ({ ...g })),
    });
    savingRef.current = false;
    setSavingConfig(false);
    toast.success("Site ayarları başarıyla kaydedildi.");
  };

  const updateGroup = (idx: number, patch: Partial<Group>) => {
    setTempGroups((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)),
    );
  };

  const groupsCard = (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h4 className="text-lg font-bold text-slate-800">
        Kurban Grupları & Fiyat Yönetimi
      </h4>
      <div className="mt-5 space-y-4">
        {tempGroups.map((grp, idx) => (
          <div key={grp.id ?? idx}>
            <div className="font-bold text-slate-700">{grp.name}</div>
            <div
              className={`mt-1.5 ${
                isMobile ? "space-y-2" : "flex items-center gap-3"
              }`}
            >
              <Input
                value={grp.price ?? ""}
                onChange={(e) => updateGroup(idx, { price: e.target.value })}
                placeholder="Fiyat aralığı (örn: 35.000 - 40.000)"
                className="h-auto flex-1 rounded-md border border-slate-300 px-3 py-2.5 text-sm shadow-none"
              />
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span>DOLDU:</span>
                  <Checkbox
                    checked={grp.isSoldOut === true}
                    onCheckedChange={(v) =>
                      updateGroup(idx, { isSoldOut: !!v })
                    }
                    className="data-checked:border-red-500 data-checked:bg-red-500"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span>Popüler:</span>
                  <Checkbox
                    checked={grp.isPopular === true}
                    onCheckedChange={(v) =>
                      updateGroup(idx, { isPopular: !!v })
                    }
                    className="data-checked:border-emerald-500 data-checked:bg-emerald-500"
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={savingConfig}
        onClick={saveConfig}
        className="mt-7 flex h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#0F9F6E] text-sm font-bold text-white transition-colors hover:bg-[#0d8b60] disabled:opacity-50"
      >
        {savingConfig ? (
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        ) : (
          <span>Fiyat ve Grupları Kaydet</span>
        )}
      </button>
    </div>
  );

  const contactCard = (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h4 className="text-lg font-bold text-slate-800">
        İletişim & Genel Ayarlar
      </h4>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-[13px] font-semibold text-slate-800">
            İletişim Telefon Numarası
          </label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 h-auto rounded-md border border-slate-300 px-3 py-2.5 text-sm shadow-none"
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-slate-800">
            Teslimat/Merkez Adresi
          </label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1.5 h-auto rounded-md border border-slate-300 px-3 py-2.5 text-sm shadow-none"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold text-slate-800">
              Canlı Kesim Takibi
            </div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              Menüdeki canlı takip butonunu aktif eder.
            </div>
          </div>
          <Switch
            checked={service.isLiveTrackingActive}
            onCheckedChange={async (v) => {
              setSavingConfig(true);
              await service.updateLiveTrackingStatus(!!v);
              setSavingConfig(false);
            }}
            className="data-checked:bg-[#0F9F6E]"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={savingConfig}
        onClick={saveConfig}
        className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#0F9F6E] text-sm font-bold text-white transition-colors hover:bg-[#0d8b60] disabled:opacity-50"
      >
        İletişim Bilgilerini Kaydet
      </button>
    </div>
  );

  const credentialsCard = (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h4 className="text-lg font-bold text-slate-800">
        Yönetici Giriş Bilgileri
      </h4>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-[13px] font-semibold text-slate-800">
            Kullanıcı Adı
          </label>
          <Input
            value={adminUser}
            onChange={(e) => setAdminUser(e.target.value)}
            className="mt-1.5 h-auto rounded-md border border-slate-300 px-3 py-2.5 text-sm shadow-none"
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-slate-800">
            Şifre
          </label>
          <Input
            type="password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            className="mt-1.5 h-auto rounded-md border border-slate-300 px-3 py-2.5 text-sm shadow-none"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={savingConfig}
        onClick={saveConfig}
        className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#0F9F6E] text-sm font-bold text-white transition-colors hover:bg-[#0d8b60] disabled:opacity-50"
      >
        Giriş Bilgilerini Güncelle
      </button>
    </div>
  );

  return (
    <div
      style={{ padding: isMobile ? 12 : isSmallPc ? 16 : 32 }}
      className="min-h-0 flex-1 overflow-y-auto"
    >
      <h3 className="text-2xl font-extrabold text-slate-900">
        Site İçerik Yönetimi
      </h3>

      <div className="mt-6">
        {isMobile || isSmallPc ? (
          <div className="space-y-6">
            {groupsCard}
            {contactCard}
            {credentialsCard}
          </div>
        ) : (
          <div className="flex items-start gap-6">
            <div className="flex-[3]">{groupsCard}</div>
            <div className="flex-[2] space-y-6">
              {contactCard}
              {credentialsCard}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

