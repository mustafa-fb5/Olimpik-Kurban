"use client";

import { useState } from "react";
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cloud,
  Hash,
  Info,
  KeyRound,
  LayoutGrid,
  PawPrint,
  Pencil,
  Phone,
  Plus,
  Scale,
  Ticket,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cloudinaryService, pickImage } from "@/lib/cloudinary";
import {
  SIZE_GROUPS,
  getSizeGroup,
  getPendingRemainingTime,
  useSiteData,
  type Animal,
  type Registration,
  type Shareholder,
} from "@/lib/site-data";

export function AnimalsTab({
  isMobile,
}: {
  isMobile: boolean;
  isSmallPc: boolean;
}) {
  const service = useSiteData();
  const animals = service.animals;
  const isCloudConfigured = cloudinaryService.isConfigured;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Dialog states
  const [addOpen, setAddOpen] = useState(false);
  const [editAnimal, setEditAnimal] = useState<Animal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [cloudinaryOpen, setCloudinaryOpen] = useState(false);
  const [shDialog, setShDialog] = useState<{
    animalId: string;
    slotIndex: number;
    existing: Shareholder;
  } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pickAndUploadPhoto = async (animalId: string) => {
    if (!cloudinaryService.isConfigured) {
      toast.warning("Önce Cloudinary ayarlarını yapılandırın!");
      setCloudinaryOpen(true);
      return;
    }

    try {
      const selected = await pickImage();
      if (!selected) return;

      const kb = (selected.file.size / 1024).toFixed(0);
      const toastId = toast.loading(`Fotoğraf yükleniyor... (${kb} KB)`);

      try {
        const url = await cloudinaryService.uploadImage(
          selected.file,
          selected.name,
        );
        await service.updateAnimalPhoto(animalId, url);
        toast.dismiss(toastId);
        toast.success("Fotoğraf başarıyla yüklendi!");
      } catch (e) {
        toast.dismiss(toastId);
        const msg =
          e instanceof Error
            ? e.message.replace("Error:", "").trim()
            : String(e);
        toast.error(`Yükleme Hatası: ${msg}`, { duration: 15000 });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Yükleme Hatası: ${msg}`);
    }
  };

  const pendingCount = service.registrations.filter(
    (r) => r.status === "pending" && !!r.animalId,
  ).length;

  return (
    <div
      style={{
        paddingLeft: 12,
        paddingTop: 12,
        paddingRight: isMobile ? 12 : 24,
        paddingBottom: 24,
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      {/* Top bar */}
      {isMobile ? (
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-[#1E293B]">
              Kurbanlık Listesi
            </h3>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                <Clock className="h-3 w-3" />
                {pendingCount} onay bekleyen
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] font-medium text-slate-500">
            Toplam {animals.length} kurbanlık kayıtlı.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setCloudinaryOpen(true)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border bg-white py-3 text-xs font-semibold ${
                isCloudConfigured
                  ? "border-[#A7F3D0] text-[#0F9F6E]"
                  : "border-amber-300 text-amber-700"
              }`}
            >
              <Cloud
                className={`h-4 w-4 ${
                  isCloudConfigured ? "text-[#0F9F6E]" : "text-amber-500"
                }`}
              />
              <span>{isCloudConfigured ? "Bulut ✓" : "Bulut Ayarla"}</span>
            </button>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-[#0F9F6E] py-3 text-xs font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Yeni Ekle</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-extrabold text-[#1E293B]">
                Kurbanlık Listesi
              </h3>
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  <Clock className="h-3 w-3" />
                  {pendingCount} onay bekleyen başvuru
                </span>
              )}
            </div>
            <p className="mt-1 text-[13px] font-medium text-slate-500">
              Toplam {animals.length} kurbanlık kayıtlı.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCloudinaryOpen(true)}
              className={`flex cursor-pointer items-center gap-2 rounded-[10px] border bg-white px-4 py-3 text-sm font-semibold transition-colors hover:bg-slate-50 ${
                isCloudConfigured
                  ? "border-[#A7F3D0] text-[#0F9F6E]"
                  : "border-amber-300 text-amber-700"
              }`}
            >
              <Cloud
                className={`h-[18px] w-[18px] ${
                  isCloudConfigured ? "text-[#0F9F6E]" : "text-amber-500"
                }`}
              />
              <span>
                {isCloudConfigured ? "Cloudinary ✓" : "Cloudinary Ayarla"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-[10px] bg-[#0F9F6E] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d8b60]"
            >
              <Plus className="h-[18px] w-[18px]" />
              <span>Yeni Kurbanlık Ekle</span>
            </button>
          </div>
        </div>
      )}

      <div className="h-6 shrink-0" />

      {/* Animals Grid */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {animals.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <PawPrint className="h-14 w-14 text-slate-300" />
            <p className="mt-4 text-base text-slate-400">
              Henüz kurbanlık eklenmemiş.
            </p>
            <p className="mt-2 text-[13px] text-slate-400">
              Yukarıdaki butona tıklayarak kurbanlık ekleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 pb-6 min-[400px]:grid-cols-2 min-[600px]:grid-cols-3 min-[900px]:grid-cols-4 min-[1200px]:grid-cols-5 min-[1500px]:grid-cols-6">
            {animals.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                expanded={expandedIds.has(animal.id)}
                onToggleExpand={() => toggleExpand(animal.id)}
                onUploadPhoto={() => pickAndUploadPhoto(animal.id)}
                onToggleSlaughter={() =>
                  service.updateAnimalSlaughterStatus(
                    animal.id,
                    animal.isSlaughtered !== true,
                  )
                }
                onEdit={() => setEditAnimal(animal)}
                onDelete={() =>
                  setDeleteTarget({ id: animal.id, name: animal.name })
                }
                onSelectSlot={(slotIndex, sh) =>
                  setShDialog({
                    animalId: animal.id,
                    slotIndex,
                    existing: sh,
                  })
                }
                onToggleTekDuzen={(slotIndex, sh) =>
                  service.updateAnimalShareholder(
                    animal.id,
                    slotIndex,
                    sh.name,
                    sh.phone,
                    { isTekDuzen: !sh.isTekDuzen },
                  )
                }
                onToggleVekalet={(slotIndex, sh) =>
                  service.updateAnimalShareholder(
                    animal.id,
                    slotIndex,
                    sh.name,
                    sh.phone,
                    { hasVekalet: !sh.hasVekalet },
                  )
                }
                onRemoveSlot={(slotIndex) =>
                  service.removeAnimalShareholder(animal.id, slotIndex)
                }
                pendingRegistrations={service.registrations.filter(
                  (r) => r.status === "pending" && r.animalId === animal.id,
                )}
                onApprovePending={async (regId) => {
                  const ok = await service.approveRegistration(regId);
                  if (ok) {
                    toast.success("Hissedar başvurusu onaylandı ve slota atandı.");
                  } else {
                    toast.error("Başvuru onaylanamadı (slot dolu olabilir).");
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Animal Dialog */}
      {(addOpen || editAnimal) && (
        <AnimalFormDialog
          animal={editAnimal}
          groups={[...SIZE_GROUPS]}
          onClose={() => {
            setAddOpen(false);
            setEditAnimal(null);
          }}
          onSubmit={async (values) => {
            if (editAnimal) {
              await service.updateAnimalDetails({
                animalId: editAnimal.id,
                name: `${values.kesimNo}. Kurbanlık`,
                earTag: values.earTag,
                group: values.group,
                kilogram: values.kilogram,
                kesimNo: values.kesimNo,
              });
              toast.success("Kurbanlık başarıyla güncellendi.");
            } else {
              await service.addAnimal({
                name: `${values.kesimNo}. Kurbanlık`,
                earTag: values.earTag,
                group: values.group,
                kilogram: values.kilogram,
                kesimNo: values.kesimNo,
              });
              toast.success("Kurbanlık başarıyla eklendi.");
            }
          }}
        />
      )}

      {/* Shareholder Dialog */}
      {shDialog && (
        <ShareholderDialog
          slotIndex={shDialog.slotIndex}
          existing={shDialog.existing}
          registrations={service.registrations}
          onClose={() => setShDialog(null)}
          onSave={async (name, phone, isTekDuzen, hasVekalet) => {
            await service.updateAnimalShareholder(
              shDialog.animalId,
              shDialog.slotIndex,
              name,
              phone,
              { isTekDuzen, hasVekalet },
            );
          }}
        />
      )}

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-[400px] rounded-2xl p-6"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Kurbanlığı Sil
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {`"${deleteTarget?.name ?? ""}" isimli kurbanlığı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!deleteTarget) return;
                const id = deleteTarget.id;
                setDeleteTarget(null);
                await service.deleteAnimal(id);
                toast.success("Kurbanlık başarıyla silindi.");
              }}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
            >
              Sil
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cloudinary Config Dialog */}
      {cloudinaryOpen && (
        <CloudinaryDialog
          initialCloudName={service.cloudinaryCloudName}
          initialPreset={service.cloudinaryUploadPreset}
          onClose={() => setCloudinaryOpen(false)}
          onSave={async (cloudName, uploadPreset) => {
            await service.updateCloudinaryConfig({ cloudName, uploadPreset });
            toast.success("Cloudinary ayarları kaydedildi.");
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Animal Card                                                         */
/* ------------------------------------------------------------------ */

function AnimalCard({
  animal,
  expanded,
  onToggleExpand,
  onUploadPhoto,
  onToggleSlaughter,
  onEdit,
  onDelete,
  onSelectSlot,
  onToggleTekDuzen,
  onToggleVekalet,
  onRemoveSlot,
  pendingRegistrations = [],
  onApprovePending,
}: {
  animal: Animal;
  expanded: boolean;
  onToggleExpand: () => void;
  onUploadPhoto: () => void;
  onToggleSlaughter: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSelectSlot: (slotIndex: number, sh: Shareholder) => void;
  onToggleTekDuzen: (slotIndex: number, sh: Shareholder) => void;
  onToggleVekalet: (slotIndex: number, sh: Shareholder) => void;
  onRemoveSlot: (slotIndex: number) => void;
  pendingRegistrations?: Registration[];
  onApprovePending?: (regId: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = animal.photoUrl ?? "";
  const shareholders = animal.shareholders ?? [];
  const filledCount = shareholders.filter((s) => (s.name ?? "").trim().length > 0).length;
  const isSlaughtered = animal.isSlaughtered === true;

  return (
    <div className="overflow-hidden rounded-2xl border-[1.5px] border-[#E2EFEA] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
      {/* Photo Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[15px]">
        {photoUrl && !imgError ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={animal.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={onUploadPhoto}
              className="absolute top-2 right-2 cursor-pointer rounded-lg bg-black/55 p-1.5 text-white hover:bg-black/75"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onUploadPhoto}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center bg-slate-100 hover:bg-slate-200/70"
          >
            <Camera className="h-8 w-8 text-slate-400" />
            <span className="mt-1.5 text-xs font-semibold text-slate-400">
              Fotoğraf Ekle
            </span>
          </button>
        )}

        {isSlaughtered && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-black tracking-[0.5px] text-white shadow">
            <Check className="h-3 w-3" />
            <span>KESİLDİ</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="px-3 pt-2.5">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-sm font-extrabold text-[#1E293B]">
            {animal.name || "Kurbanlık"}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onToggleSlaughter}
              title={
                isSlaughtered
                  ? "Kesildi (Geri Al)"
                  : "Kesildi Olarak İşaretle"
              }
              className={`cursor-pointer rounded-full p-1 ${
                isSlaughtered
                  ? "bg-[#ECFDF5] text-emerald-600"
                  : "bg-slate-50 text-slate-400"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onEdit}
              title="Düzenle"
              className="cursor-pointer rounded-full bg-[#ECFDF5] p-1 text-[#0F9F6E]"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Sil"
              className="cursor-pointer rounded-full bg-red-50 p-1 text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-1.5 py-0.5 text-[9px] font-bold text-[#0D7A52]">
            {animal.group ?? ""}
          </span>
          {animal.earTag && (
            <span className="truncate text-[10px] text-slate-500">
              {animal.earTag}
            </span>
          )}
        </div>

        {(animal.kesimNo || animal.kilogram) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {animal.kesimNo && (
              <span className="inline-flex items-center gap-0.5 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                <Hash className="h-2.5 w-2.5" />
                Sıra No: {animal.kesimNo}
              </span>
            )}
            {animal.kilogram && (
              <span className="inline-flex items-center gap-0.5 rounded-md border border-[#E2EFE9] bg-[#F1F5F3] px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                <Scale className="h-2.5 w-2.5" />
                {animal.kilogram} kg
              </span>
            )}
          </div>
        )}
      </div>

      <div className="my-2 h-px bg-[#F1F5F3]" />

      {/* Shareholders Header */}
      <div className="px-2">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg px-1.5 py-1 hover:bg-slate-50"
        >
          <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-600">
            <span>Hissedarlar</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </span>
          <div className="flex items-center gap-1">
            {pendingRegistrations.length > 0 && (
              <span
                title={`${pendingRegistrations.length} onay bekleyen başvuru`}
                className="inline-flex items-center gap-0.5 rounded-lg border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700 animate-pulse"
              >
                <Clock className="h-2.5 w-2.5" />
                {pendingRegistrations.length} Onay
              </span>
            )}
            <span
              className={`rounded-lg px-1.5 py-0.5 text-[10px] font-extrabold ${
                filledCount === 7
                  ? "bg-[#ECFDF5] text-[#047857]"
                  : "bg-[#FEF3C7] text-[#B45309]"
              }`}
            >
              {filledCount} / 7
            </span>
          </div>
        </button>
      </div>

      {/* Shareholder Slots */}
      {expanded && (
        <div className="mt-1 space-y-1 px-2 pb-2">
          {shareholders.map((sh, i) => {
            const isEmpty = !sh.name;
            const isTekDuzen = sh.isTekDuzen === true;
            const hasVekalet = sh.hasVekalet === true;
            const pendingReg = isEmpty
              ? pendingRegistrations.find((p) => p.slotIndex === i)
              : undefined;

            return (
              <div
                key={i}
                onClick={() => onSelectSlot(i, sh)}
                className={`flex cursor-pointer items-center rounded-md px-2 py-1.5 ${
                  isEmpty
                    ? pendingReg
                      ? "border-[1.5px] border-amber-400 bg-amber-50/70"
                      : "border border-slate-200 bg-slate-50"
                    : isTekDuzen
                      ? "border-[1.5px] border-emerald-500 bg-[#ECFDF5]"
                      : "border border-slate-200 bg-white"
                }`}
              >
                <div
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                    isEmpty
                      ? pendingReg
                        ? "bg-amber-500"
                        : "bg-slate-300"
                      : isTekDuzen
                        ? "bg-emerald-500"
                        : "bg-slate-500"
                  }`}
                >
                  {i + 1}
                </div>

                <div className="ml-1.5 min-w-0 flex-1">
                  {isEmpty ? (
                    pendingReg ? (
                      (() => {
                        const rem = getPendingRemainingTime(pendingReg.createdAt);
                        return (
                          <div>
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="truncate text-[10px] font-extrabold text-amber-900">
                                {pendingReg.name}
                              </span>
                              <span
                                className={`inline-flex items-center gap-0.5 rounded px-1 py-0.2 text-[8px] font-bold ${
                                  rem.isExpired
                                    ? "bg-red-200 text-red-900"
                                    : "bg-amber-200/90 text-amber-900"
                                }`}
                              >
                                <Clock className="h-2 w-2" />
                                {rem.text}
                              </span>
                            </div>
                            {pendingReg.phone && (
                              <div className="text-[9px] text-amber-700">
                                {pendingReg.phone}
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-[10px] italic text-slate-400">
                        Boş Hisse — Ata
                      </span>
                    )
                  ) : (
                    <div>
                      <div className="truncate text-[10px] font-bold text-slate-700">
                        {sh.name}
                      </div>
                      {sh.phone && (
                        <div className="text-[9px] text-slate-500">
                          {sh.phone}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {pendingReg && isEmpty && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex shrink-0 items-center gap-1"
                  >
                    <button
                      type="button"
                      title="Başvuruyu Onayla"
                      onClick={() => onApprovePending?.(pendingReg.id)}
                      className="inline-flex cursor-pointer items-center gap-0.5 rounded-md bg-[#0F9F6E] px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-[#0d8b60]"
                    >
                      <Check className="h-2.5 w-2.5" />
                      Onayla
                    </button>
                  </div>
                )}

                {!isEmpty && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex shrink-0 items-center gap-1"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTekDuzen(i, sh)}
                      className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-[1.2px] text-[10px] font-black ${
                        isTekDuzen
                          ? "border-emerald-600 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white text-slate-500"
                      }`}
                    >
                      T
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleVekalet(i, sh)}
                      className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-[1.2px] text-[10px] font-black ${
                        hasVekalet
                          ? "border-blue-600 bg-blue-500 text-white"
                          : "border-slate-300 bg-white text-slate-500"
                      }`}
                    >
                      V
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveSlot(i)}
                      className="ml-0.5 cursor-pointer rounded p-0.5 text-red-400 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dialogs                                                             */
/* ------------------------------------------------------------------ */

function AnimalFormDialog({
  animal,
  groups,
  onClose,
  onSubmit,
}: {
  animal: Animal | null;
  groups: string[];
  onClose: () => void;
  onSubmit: (values: {
    kesimNo: string;
    earTag: string;
    group: string;
    kilogram: string;
  }) => Promise<void>;
}) {
  const [kesimNo, setKesimNo] = useState(animal?.kesimNo ?? "");
  const [earTag, setEarTag] = useState(animal?.earTag ?? "");
  const [group, setGroup] = useState<string>(
    animal ? getSizeGroup(animal.group) : (groups[0] ?? "Küçük Grup"),
  );
  const [kilogram, setKilogram] = useState(animal?.kilogram ?? "");

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[440px] rounded-2xl p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-900">
            {animal ? "Kurbanlık Düzenle" : "Yeni Kurbanlık Ekle"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <LabeledField
            label="Sıra No"
            icon={<Ticket className="h-5 w-5 text-slate-400" />}
          >
            <Input
              type="number"
              value={kesimNo}
              onChange={(e) => setKesimNo(e.target.value)}
              placeholder="Örn: 42"
              className="h-auto border-0 bg-transparent px-2 py-3 text-sm shadow-none focus-visible:ring-0"
            />
          </LabeledField>

          <LabeledField
            label="Küpe Numarası"
            icon={<Hash className="h-5 w-5 text-slate-400" />}
          >
            <Input
              value={earTag}
              onChange={(e) => setEarTag(e.target.value)}
              placeholder="Örn: TR-123456"
              className="h-auto border-0 bg-transparent px-2 py-3 text-sm shadow-none focus-visible:ring-0"
            />
          </LabeledField>

          <div>
            <label className="text-xs font-semibold text-slate-600">Grup</label>
            <div className="mt-1 flex items-center rounded-xl border border-slate-300 px-3">
              <LayoutGrid className="mr-2 h-5 w-5 text-slate-400" />
              <Select value={group} onValueChange={(v) => v && setGroup(v)}>
                <SelectTrigger className="!h-auto flex-1 border-0 bg-transparent py-3 pl-0 text-sm shadow-none focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <LabeledField
            label="Kilogram"
            icon={<Scale className="h-5 w-5 text-slate-400" />}
          >
            <Input
              type="number"
              value={kilogram}
              onChange={(e) => setKilogram(e.target.value)}
              placeholder="Örn: 350"
              className="h-auto border-0 bg-transparent px-2 py-3 text-sm shadow-none focus-visible:ring-0"
            />
          </LabeledField>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!kesimNo.trim()) return;
              onClose();
              await onSubmit({
                kesimNo: kesimNo.trim(),
                earTag: earTag.trim(),
                group,
                kilogram: kilogram.trim(),
              });
            }}
            className="cursor-pointer rounded-[10px] bg-[#0F9F6E] px-5 py-2 text-sm font-bold text-white hover:bg-[#0d8b60]"
          >
            {animal ? "Kaydet" : "Ekle"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShareholderDialog({
  slotIndex,
  existing,
  registrations,
  onClose,
  onSave,
}: {
  slotIndex: number;
  existing: Shareholder;
  registrations: ReturnType<typeof useSiteData>["registrations"];
  onClose: () => void;
  onSave: (
    name: string,
    phone: string,
    isTekDuzen: boolean,
    hasVekalet: boolean,
  ) => Promise<void>;
}) {
  const [name, setName] = useState(existing.name ?? "");
  const [phone, setPhone] = useState(existing.phone ?? "");
  const [isTekDuzen, setIsTekDuzen] = useState(existing.isTekDuzen === true);
  const [hasVekalet, setHasVekalet] = useState(existing.hasVekalet === true);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[440px] rounded-2xl p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-900">
            Hisse {slotIndex + 1} — Hissedar Ata
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <button
            type="button"
            onClick={() => {
              setName("Rezerve");
              setPhone("");
            }}
            className="w-full cursor-pointer rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-[13px] font-bold text-amber-800 hover:bg-amber-100"
          >
            Hızlı Rezerve (ana ekranda &quot;Dolu&quot; görünür)
          </button>

          <LabeledField
            label="Ad Soyad"
            icon={<User className="h-5 w-5 text-slate-400" />}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-auto border-0 bg-transparent px-2 py-3 text-sm shadow-none focus-visible:ring-0"
            />
          </LabeledField>

          <LabeledField
            label="Telefon"
            icon={<Phone className="h-5 w-5 text-slate-400" />}
          >
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="h-auto border-0 bg-transparent px-2 py-3 text-sm shadow-none focus-visible:ring-0"
            />
          </LabeledField>

          <label className="flex cursor-pointer items-center gap-3 py-1">
            <Checkbox
              checked={isTekDuzen}
              onCheckedChange={(v) => setIsTekDuzen(!!v)}
              className="data-checked:border-[#0F9F6E] data-checked:bg-[#0F9F6E]"
            />
            <div>
              <div className="text-sm font-semibold text-slate-800">T</div>
              <div className="text-[11px] text-slate-500">
                Hissedar için tek düzen ayarı uygular
              </div>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 py-1">
            <Checkbox
              checked={hasVekalet}
              onCheckedChange={(v) => setHasVekalet(!!v)}
              className="data-checked:border-[#0F9F6E] data-checked:bg-[#0F9F6E]"
            />
            <div className="text-sm font-semibold text-slate-800">V</div>
          </label>

          {registrations.length > 0 && (
            <div className="border-t border-slate-200 pt-3">
              <div className="text-[13px] font-semibold text-slate-600">
                Kayıtlı Hissedardan Seç:
              </div>
              <div className="mt-2 max-h-[150px] space-y-1 overflow-y-auto">
                {registrations.map((reg) => {
                  const groupName = reg.isDonation
                    ? "Bağış Hisse"
                    : (reg.group ?? "");
                  return (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => {
                        setName(reg.name ?? "");
                        setPhone(reg.phone ?? "");
                        setIsTekDuzen(reg.isTekDuzen === true);
                        setHasVekalet(reg.hasVekalet === true);
                      }}
                      className="flex w-full cursor-pointer flex-col items-start rounded-lg px-2.5 py-2 text-left hover:bg-emerald-50"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-semibold text-slate-800">
                          {reg.name}
                        </span>
                        {groupName && (
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${
                              reg.isDonation
                                ? "border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]"
                                : "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]"
                            }`}
                          >
                            {groupName}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{reg.phone}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={async () => {
              onClose();
              await onSave(name.trim(), phone.trim(), isTekDuzen, hasVekalet);
            }}
            className="cursor-pointer rounded-[10px] bg-[#0F9F6E] px-5 py-2 text-sm font-bold text-white hover:bg-[#0d8b60]"
          >
            Kaydet
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CloudinaryDialog({
  initialCloudName,
  initialPreset,
  onClose,
  onSave,
}: {
  initialCloudName: string;
  initialPreset: string;
  onClose: () => void;
  onSave: (cloudName: string, preset: string) => Promise<void>;
}) {
  const [cloudName, setCloudName] = useState(initialCloudName);
  const [preset, setPreset] = useState(initialPreset);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[480px] rounded-2xl p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-900">
            Cloudinary Yapılandırması
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="flex items-center gap-2.5 rounded-[10px] border border-amber-200 bg-amber-50 p-3">
            <Info className="h-[18px] w-[18px] shrink-0 text-amber-700" />
            <p className="text-xs text-amber-800">
              Fotoğraf yükleme için Cloudinary hesabınızdan cloud name ve
              unsigned upload preset bilgilerini girin.
            </p>
          </div>

          <LabeledField
            label="Cloud Name"
            icon={<Cloud className="h-5 w-5 text-slate-400" />}
          >
            <Input
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              placeholder="Örn: dxyz1234"
              className="h-auto border-0 bg-transparent px-2 py-3 text-sm shadow-none focus-visible:ring-0"
            />
          </LabeledField>

          <LabeledField
            label="Upload Preset (Unsigned)"
            icon={<KeyRound className="h-5 w-5 text-slate-400" />}
          >
            <Input
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              placeholder="Örn: ml_default"
              className="h-auto border-0 bg-transparent px-2 py-3 text-sm shadow-none focus-visible:ring-0"
            />
          </LabeledField>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={async () => {
              onClose();
              await onSave(cloudName.trim(), preset.trim());
            }}
            className="cursor-pointer rounded-[10px] bg-[#0F9F6E] px-5 py-2 text-sm font-bold text-white hover:bg-[#0d8b60]"
          >
            Kaydet
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LabeledField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <div className="mt-1 flex items-center rounded-xl border border-slate-300 pl-3 focus-within:border-[#0F9F6E]">
        {icon}
        {children}
      </div>
    </div>
  );
}

