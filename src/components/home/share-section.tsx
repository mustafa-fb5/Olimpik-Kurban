"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Clock, Hash, Loader2, PawPrint, Phone, Scale, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SIZE_GROUPS,
  getSizeGroup,
  useSiteData,
  type Animal,
  type Registration,
  type SizeGroup,
} from "@/lib/site-data";
import { useReveal } from "@/hooks/use-reveal";

const TOTAL_SLOTS = 7;

export function ShareSection() {
  const service = useSiteData();
  const { ref, visible } = useReveal<HTMLElement>(0.1);
  const [activeGroup, setActiveGroup] = useState<SizeGroup>(SIZE_GROUPS[0]);
  const [currentPage, setCurrentPage] = useState(0);
  const [target, setTarget] = useState<{ animal: Animal; slotIndex: number } | null>(null);

  const PAGE_SIZE = 3;
  const animals = service.animals.filter((a) => !a.isSlaughtered);
  const byGroup = (g: SizeGroup) => animals.filter((a) => getSizeGroup(a.group) === g);
  const shown = byGroup(activeGroup);
  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const paginated = shown.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const handleGroupChange = (group: SizeGroup) => {
    setActiveGroup(group);
    setCurrentPage(0);
  };

  return (
    <section
      ref={ref}
      className={`bg-slate-50 px-5 py-14 md:px-12 md:py-20 min-[1201px]:px-[120px] min-[1201px]:py-24 ${
        visible ? "is-visible" : ""
      }`}
    >
      <div className="reveal-fade mx-auto max-w-[1200px]">
        <div className="text-center">
          <h2 className="text-[28px] font-extrabold text-slate-900 md:text-[36px]">
            Hisse Seç &amp; Başvur
          </h2>
          <p className="mx-auto mt-2 max-w-[640px] text-[15px] text-slate-500">
            Size uygun grubu seçin, boş hisselerden birine ad soyad ve telefon
            numaranızla başvurun. Başvurunuz yönetici onayından sonra kesinleşir.
          </p>
        </div>

        {/* Group tabs */}
        <div className="mx-auto mt-8 grid max-w-[640px] grid-cols-3 rounded-[18px] bg-slate-100 p-1">
          {SIZE_GROUPS.map((g) => {
            const active = g === activeGroup;
            return (
              <button
                key={g}
                type="button"
                onClick={() => handleGroupChange(g)}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-[14px] py-3 text-sm font-bold transition-all ${
                  active
                    ? "bg-white text-emerald-600 shadow-[0_0_8px_rgba(0,0,0,0.06)]"
                    : "text-slate-500"
                }`}
              >
                <span>{g}</span>
                <span className="text-[11px] font-medium opacity-70">
                  {byGroup(g).length} hayvan
                </span>
              </button>
            );
          })}
        </div>

        {/* Animals Info Header */}
        {shown.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-500">
              Toplam <span className="text-slate-900 font-bold">{shown.length}</span> kurbanlık
              {totalPages > 1 && (
                <span className="ml-2 text-xs text-slate-400">
                  (Sayfa {currentPage + 1} / {totalPages})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Animals Carousel Section with Large Side Arrows */}
        {shown.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-slate-400">
            <PawPrint className="h-10 w-10" />
            <p className="mt-3 text-sm">Bu grupta henüz hayvan bulunmuyor.</p>
          </div>
        ) : (
          <div className="relative mt-4">
            {/* Left Large Arrow */}
            {totalPages > 1 && (
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                aria-label="Önceki kurbanlar"
                className="absolute -left-4 md:-left-7 top-1/2 z-20 flex h-12 w-12 md:h-14 md:w-14 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-xl transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-0"
              >
                <ChevronLeft className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2.5} />
              </button>
            )}

            {/* Animals Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 min-[1201px]:grid-cols-3">
              {paginated.map((animal) => (
                <AnimalShareCard
                  key={animal.id}
                  animal={animal}
                  getStatus={(i) => service.getSlotStatus(animal, i)}
                  getPendingReg={(i) => service.getPendingRegistration(animal.id, i)}
                  onPick={(slotIndex) => setTarget({ animal, slotIndex })}
                />
              ))}
            </div>

            {/* Right Large Arrow */}
            {totalPages > 1 && (
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                aria-label="Sonraki kurbanlar"
                className="absolute -right-4 md:-right-7 top-1/2 z-20 flex h-12 w-12 md:h-14 md:w-14 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-xl transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-0"
              >
                <ChevronRight className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}

        {/* Bottom Pagination Dots for multi-page */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPage(idx)}
                aria-label={`Sayfa ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentPage
                    ? "w-8 bg-emerald-600"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {target && (
        <ApplyDialog
          animal={target.animal}
          slotIndex={target.slotIndex}
          onClose={() => setTarget(null)}
        />
      )}
    </section>
  );
}

function AnimalShareCard({
  animal,
  getStatus,
  getPendingReg,
  onPick,
}: {
  animal: Animal;
  getStatus: (slotIndex: number) => "empty" | "pending" | "full";
  getPendingReg: (slotIndex: number) => Registration | undefined;
  onPick: (slotIndex: number) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const statuses = Array.from({ length: TOTAL_SLOTS }, (_, i) => getStatus(i));
  const emptyCount = statuses.filter((s) => s === "empty").length;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {animal.photoUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={animal.photoUrl}
            alt={animal.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-slate-300">
            <PawPrint className="h-12 w-12" />
            <span className="mt-1 text-xs font-semibold">Fotoğraf yakında</span>
          </div>
        )}
        <div
          className={`absolute top-3 right-3 rounded-lg px-2.5 py-1 text-[11px] font-black text-white shadow ${
            emptyCount === 0 ? "bg-slate-600" : "bg-emerald-600"
          }`}
        >
          {emptyCount === 0 ? "DOLU" : `${emptyCount} BOŞ HİSSE`}
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {animal.kesimNo && (
            <Badge icon={<Hash className="h-3 w-3" />} text={`Sıra No: ${animal.kesimNo}`} tone="blue" />
          )}
          {animal.earTag && <Badge text={`Küpe: ${animal.earTag}`} tone="slate" />}
          {animal.kilogram && (
            <Badge icon={<Scale className="h-3 w-3" />} text={`${animal.kilogram} kg`} tone="emerald" />
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
          {statuses.map((status, i) => {
            if (status === "empty") {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPick(i)}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-left text-[13px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <span>Hisse {i + 1}</span>
                  <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] text-white">
                    Başvur
                  </span>
                </button>
              );
            }
            if (status === "pending") {
              const reg = getPendingReg(i);
              return <PendingSlotButton key={i} slotIndex={i} registration={reg} />;
            }
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-[13px] font-bold text-slate-400"
              >
                <span>Hisse {i + 1}</span>
                <span className="text-[11px]">Dolu</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PendingSlotButton({
  slotIndex,
  registration,
}: {
  slotIndex: number;
  registration?: Registration;
}) {
  const [countdown, setCountdown] = useState<string>("14 gün kaldı");

  useEffect(() => {
    const calc = () => {
      const created = registration?.createdAt ? new Date(registration.createdAt).getTime() : Date.now();
      const deadline = created + 14 * 24 * 60 * 60 * 1000;
      const diffMs = deadline - Date.now();

      if (diffMs <= 0) {
        setCountdown("Süre doldu");
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (days >= 1) {
        setCountdown(`${days} gün ${hours} sa kaldı`);
      } else {
        setCountdown(`${hours} sa ${minutes} dk kaldı`);
      }
    };

    calc();
    const interval = setInterval(calc, 60000); // dakikada bir güncelle
    return () => clearInterval(interval);
  }, [registration?.createdAt]);

  return (
    <div
      title="Onay aşamasında (14 gün içinde en az 10.000 ₺ kapora bekleniyor)"
      className="flex flex-col justify-center rounded-xl border-2 border-yellow-400 bg-yellow-100 px-3 py-2 text-left shadow-sm transition-all animate-pulse"
    >
      <div className="flex items-center justify-between text-[13px] font-black text-amber-950">
        <span>Hisse {slotIndex + 1}</span>
        <span className="rounded bg-yellow-400/80 px-1.5 py-0.5 text-[10px] font-black uppercase text-amber-900 tracking-wider">
          Onay Aşamasında
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-800">
        <Clock className="h-3 w-3 text-amber-700 shrink-0" />
        <span className="truncate">{countdown}</span>
      </div>
    </div>
  );
}

function Badge({
  text,
  icon,
  tone,
}: {
  text: string;
  icon?: React.ReactNode;
  tone: "blue" | "slate" | "emerald";
}) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-bold ${tones[tone]}`}
    >
      {icon}
      {text}
    </span>
  );
}

function ApplyDialog({
  animal,
  slotIndex,
  onClose,
}: {
  animal: Animal;
  slotIndex: number;
  onClose: () => void;
}) {
  const service = useSiteData();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"success" | "taken" | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 3 || !name.trim().includes(" "))
      next.name = "Ad ve soyadınızı girin";
    if (phone.replace(/\D/g, "").length < 10) next.phone = "Geçerli bir telefon girin";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const ok = await service.applyForShare({
      animalId: animal.id,
      slotIndex,
      name: name.trim(),
      phone: phone.trim(),
    });
    setSubmitting(false);
    setResult(ok ? "success" : "taken");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-[440px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-900">
            {animal.kesimNo ? `${animal.kesimNo}. Kurbanlık` : animal.name} — Hisse {slotIndex + 1}
          </DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                result === "success"
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  : "bg-amber-500"
              }`}
            >
              <Check className="h-8 w-8 text-white" />
            </div>
            <p className="mt-4 text-base font-bold text-slate-900">
              {result === "success" ? "Başvurunuz alındı!" : "Bu hisse artık müsait değil"}
            </p>
            <p className="mt-1.5 text-sm text-slate-500">
              {result === "success"
                ? "Başvurunuz onay aşamasına alındı. Kesinleşmesi için 2 hafta içinde en az 10.000 ₺ kapora ödenmesi gerekmektedir."
                : "Başka biri bu hisseye başvurmuş. Lütfen başka bir hisse seçin."}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full cursor-pointer rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500"
            >
              Tamam
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <Field label="Ad Soyad *" icon={<User className="h-5 w-5 text-slate-400" />} error={errors.name}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="h-auto border-0 bg-transparent px-2 py-3 text-sm shadow-none focus-visible:ring-0"
              />
            </Field>
            <Field label="Telefon *" icon={<Phone className="h-5 w-5 text-slate-400" />} error={errors.phone}>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0555 000 00 00"
                className="h-auto border-0 bg-transparent px-2 py-3 text-sm shadow-none focus-visible:ring-0"
              />
            </Field>

            {/* Kapora ve İptal Bilgilendirme Notu */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs leading-relaxed text-amber-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Önemli Bilgilendirme:</strong> Başvurunun kesin onaylanması için 2 hafta içinde en az 10.000 ₺ kapora ödenmesi gerekmektedir. Aksi takdirde 2 hafta sonra başvuru otomatik iptal edilecektir.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Başvur"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <div
        className={`mt-1 flex items-center rounded-xl border pl-3 focus-within:border-emerald-500 ${
          error ? "border-red-400" : "border-slate-300"
        }`}
      >
        {icon}
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

