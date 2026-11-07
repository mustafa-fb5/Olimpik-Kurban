"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  FileText,
  HeartHandshake,
  Loader2,
  Phone,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSiteData } from "@/lib/site-data";
import { useReveal } from "@/hooks/use-reveal";

export function RegistrationForm() {
  const service = useSiteData();
  const texts = service.mainPageTexts;
  const activeGroups = service.groups
    .filter((g) => g.isSoldOut !== true)
    .map((g) => `${g.name} (${g.price} TL)`);

  const { ref, visible } = useReveal<HTMLElement>(0.15);

  const [isDonation, setIsDonation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    group?: string;
  }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Zorunlu alan";
    if (!phone.trim()) nextErrors.phone = "Zorunlu alan";
    if (!isDonation && !selectedGroup) nextErrors.group = "Zorunlu alan";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    await service.addRegistration({
      name: name.trim(),
      phone: phone.trim(),
      address: "",
      group: isDonation ? "" : selectedGroup,
      note: note.trim(),
      isDonation,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setSelectedGroup("");
    setName("");
    setPhone("");
    setNote("");
    setErrors({});
  };

  return (
    <section
      ref={ref}
      className={`bg-slate-50 px-5 py-14 md:px-12 md:py-20 min-[1201px]:px-[120px] min-[1201px]:py-24 ${
        visible ? "is-visible" : ""
      }`}
    >
      <div className="reveal-fade mx-auto max-w-[640px] rounded-[28px] border border-slate-100 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]">
        {submitted ? (
          <div className="flex flex-col items-center p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h3 className="mt-6 text-[28px] font-extrabold text-slate-900">
              {texts.reg_success_title ?? "Kaydınız Alındı!"}
            </h3>
            <p className="mt-3 text-base leading-[1.6] text-slate-500">
              {texts.reg_success_desc ??
                "Kaydınız başarıyla oluşturuldu. En kısa sürede sizinle iletişime geçeceğiz."}
            </p>
            <div className="mt-8 w-full">
              <FormSubmitButton label="Yeni Kayıt" onClick={reset} />
            </div>
          </div>
        ) : (
          <div>
            {/* Tab switcher */}
            <div className="px-5 pt-5">
              <div className="grid grid-cols-2 rounded-[18px] bg-slate-100 p-1">
                <TabButton
                  label="Hisse Kaydı"
                  icon={<CheckCircle2 className="h-[18px] w-[18px]" />}
                  active={!isDonation}
                  onClick={() => setIsDonation(false)}
                />
                <TabButton
                  label="Bağış Hisse"
                  icon={<HeartHandshake className="h-[18px] w-[18px]" />}
                  active={isDonation}
                  onClick={() => setIsDonation(true)}
                />
              </div>
            </div>

            {/* Form content */}
            <form onSubmit={submit} noValidate className="p-6 md:p-9">
              <div className="text-center">
                <h2 className="text-[26px] font-extrabold text-slate-900">
                  {isDonation
                    ? (texts.reg_donation_title ?? "Bağış Hisse Formu")
                    : (texts.reg_title ?? "Kurban Kayıt Formu")}
                </h2>
                <p className="mt-2 text-[15px] text-slate-500">
                  {isDonation
                    ? (texts.reg_donation_subtitle ??
                      "Muhtaçlar için bağış hissenizi kaydedin.")
                    : (texts.reg_subtitle ??
                      "Hissenizi ayırtmak için bilgileri eksiksiz doldurun.")}
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Ad Soyad *
                    </label>
                    <div
                      className={`mt-1.5 flex items-center rounded-[14px] border bg-slate-50 transition-colors focus-within:border-2 focus-within:border-emerald-500 ${
                        errors.name ? "border-red-400" : "border-slate-200"
                      }`}
                    >
                      <User className="ml-3.5 mr-2 h-5 w-5 shrink-0 text-slate-400" />
                      <Input
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                        }}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="h-auto border-0 bg-transparent px-2 py-4 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Telefon *
                    </label>
                    <div
                      className={`mt-1.5 flex items-center rounded-[14px] border bg-slate-50 transition-colors focus-within:border-2 focus-within:border-emerald-500 ${
                        errors.phone ? "border-red-400" : "border-slate-200"
                      }`}
                    >
                      <Phone className="ml-3.5 mr-2 h-5 w-5 shrink-0 text-slate-400" />
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone)
                            setErrors((p) => ({ ...p, phone: undefined }));
                        }}
                        placeholder="0555 000 00 00"
                        className="h-auto border-0 bg-transparent px-2 py-4 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Group & Note */}
                <div
                  className={
                    isDonation
                      ? "grid grid-cols-1 gap-4"
                      : "grid grid-cols-1 gap-4 md:grid-cols-2"
                  }
                >
                  {!isDonation && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Kurban Grubu *
                      </label>
                      <div className="mt-1.5">
                        <Select
                          value={selectedGroup || null}
                          onValueChange={(v) => {
                            setSelectedGroup(v ?? "");
                            if (errors.group)
                              setErrors((p) => ({ ...p, group: undefined }));
                          }}
                        >
                          <SelectTrigger
                            className={`!h-auto w-full rounded-[14px] border bg-slate-50 px-4 py-4 text-sm shadow-none focus-visible:border-emerald-500 focus-visible:ring-0 ${
                              errors.group ? "border-red-400" : "border-slate-200"
                            }`}
                          >
                            <SelectValue placeholder="Seçiniz..." />
                          </SelectTrigger>
                          <SelectContent>
                            {activeGroups.map((g) => (
                              <SelectItem key={g} value={g} className="text-sm">
                                {g}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {errors.group && (
                        <p className="mt-1 text-xs text-red-500">{errors.group}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Not (İsteğe Bağlı)
                    </label>
                    <div className="mt-1.5 flex items-center rounded-[14px] border border-slate-200 bg-slate-50 transition-colors focus-within:border-2 focus-within:border-emerald-500">
                      <FileText className="ml-3.5 mr-2 h-5 w-5 shrink-0 text-slate-400" />
                      <Input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={
                          isDonation
                            ? "Örn: Bağış detayları, kurum bilgisi vb."
                            : "Örn: 2 Hisse veya vekalet notu"
                        }
                        className="h-auto border-0 bg-transparent px-2 py-4 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <FormSubmitButton
                  type="submit"
                  label={
                    isDonation ? "Bağış Kaydımı Tamamla" : "Kaydımı Tamamla"
                  }
                  isLoading={submitting}
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-[14px] py-3.5 text-sm font-bold transition-all duration-250 ${
        active
          ? "bg-white text-emerald-600 shadow-[0_0_8px_rgba(0,0,0,0.06)]"
          : "text-slate-500"
      }`}
    >
      <span className={active ? "text-emerald-600" : "text-slate-400"}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

function FormSubmitButton({
  label,
  onClick,
  isLoading,
  type = "button",
}: {
  label: string;
  onClick?: () => void;
  isLoading?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className="flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-[18px] text-[17px] font-bold text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)] transition-all duration-250 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}

