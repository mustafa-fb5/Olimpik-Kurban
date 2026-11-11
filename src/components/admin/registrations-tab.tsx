"use client";

import { useState } from "react";
import {
  Check,
  Download,
  Filter,
  ListFilter,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
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
import { useSiteData, type Animal, type Registration } from "@/lib/site-data";

const STATUS_OPTIONS = [
  { value: "Tümü", label: "Tüm Durumlar" },
  { value: "Onay Bekleyenler", label: "Onay Bekleyenler" },
  { value: "Atananlar", label: "Atananlar" },
  { value: "Atanmayanlar", label: "Atanmayanlar" },
  { value: "Vekaleti Alınanlar", label: "Vekaleti Alınanlar" },
  { value: "Vekaleti Alınmayanlar", label: "Vekaleti Alınmayanlar" },
  { value: "Tek Düzene Eklenenler", label: "Tek Düzene Eklenenler" },
  { value: "Tek Düzene Eklenmeyenler", label: "Tek Düzene Eklenmeyenler" },
];

function formatLocalDate(iso: string | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RegistrationsTab({
  isMobile,
  isSmallPc,
}: {
  isMobile: boolean;
  isSmallPc: boolean;
}) {
  const service = useSiteData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("Tümü");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("Tümü");

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [assignReg, setAssignReg] = useState<Registration | null>(null);

  const groupFilterOptions = [
    "Tümü",
    "Bağış Hisse",
    ...service.groups.map((g) => g.name),
  ];

  const filtered = service.registrations.filter((reg) => {
    if (selectedGroupFilter === "Bağış Hisse") {
      if (reg.isDonation !== true) return false;
    } else if (selectedGroupFilter !== "Tümü") {
      const groupField = (reg.group ?? "").toString().toLowerCase();
      const filterLower = selectedGroupFilter.toLowerCase();
      if (!groupField.includes(filterLower) || reg.isDonation === true)
        return false;
    }

    if (selectedStatusFilter === "Onay Bekleyenler") {
      if (reg.status !== "pending") return false;
    } else if (selectedStatusFilter !== "Tümü") {
      const regNameLower = (reg.name ?? "").toString().trim().toLowerCase();
      const isAssigned = service.animals.some((animal) =>
        (animal.shareholders ?? []).some(
          (s) => (s.name ?? "").toString().trim().toLowerCase() === regNameLower,
        ),
      );
      if (selectedStatusFilter === "Atananlar" && !isAssigned) return false;
      if (selectedStatusFilter === "Atanmayanlar" && isAssigned) return false;
      if (selectedStatusFilter === "Vekaleti Alınanlar" && reg.hasVekalet !== true)
        return false;
      if (
        selectedStatusFilter === "Vekaleti Alınmayanlar" &&
        reg.hasVekalet === true
      )
        return false;
      if (
        selectedStatusFilter === "Tek Düzene Eklenenler" &&
        reg.isTekDuzen !== true
      )
        return false;
      if (
        selectedStatusFilter === "Tek Düzene Eklenmeyenler" &&
        reg.isTekDuzen === true
      )
        return false;
    }

    const q = searchQuery.toLowerCase();
    return (
      (reg.name ?? "").toLowerCase().includes(q) ||
      (reg.phone ?? "").toLowerCase().includes(q) ||
      (reg.note ?? "").toLowerCase().includes(q) ||
      (reg.group ?? "").toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const lines = ["\uFEFFAd Soyad;Telefon;Grup/Tür;Adres;Not;Tarih"];
    for (const reg of service.registrations) {
      const date = reg.createdAt ? formatLocalDate(reg.createdAt) : "";
      const type = reg.isDonation ? "Bağış Hisse" : (reg.group ?? "");
      lines.push(
        `${reg.name ?? ""};${reg.phone ?? ""};${type};${reg.address ?? ""};${reg.note ?? ""};${date}`,
      );
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hissedarlar.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const compact = isMobile || isSmallPc;

  const controls = (
    <>
      {/* Group Filter */}
      <Select
        value={selectedGroupFilter}
        onValueChange={(v) => v && setSelectedGroupFilter(v)}
      >
        <SelectTrigger
          className={`!h-auto rounded-[10px] border border-slate-200 bg-white px-3 font-semibold text-slate-700 shadow-none ${
            compact ? "py-2 text-[13px]" : "py-2.5 text-sm"
          }`}
        >
          <SelectValue />
          <ListFilter className="ml-1 h-4 w-4 text-slate-500" />
        </SelectTrigger>
        <SelectContent>
          {groupFilterOptions.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={selectedStatusFilter}
        onValueChange={(v) => v && setSelectedStatusFilter(v)}
      >
        <SelectTrigger
          className={`!h-auto rounded-[10px] border border-slate-200 bg-white px-3 font-semibold text-slate-700 shadow-none ${
            compact ? "py-2 text-[13px]" : "py-2.5 text-sm"
          }`}
        >
          <SelectValue>
            {STATUS_OPTIONS.find((s) => s.value === selectedStatusFilter)
              ?.label ?? selectedStatusFilter}
          </SelectValue>
          <Filter className="ml-1 h-4 w-4 text-slate-500" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search Bar */}
      <div
        style={{ width: isMobile ? 180 : compact ? 220 : 260 }}
        className={`flex items-center rounded-[10px] border border-slate-200 bg-white px-3 ${
          compact ? "h-10" : "h-[42px]"
        }`}
      >
        <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ara..."
          className="h-auto border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="ml-1 cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Export Button */}
      <button
        type="button"
        disabled={filtered.length === 0}
        onClick={exportCSV}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-[10px] bg-[#0F9F6E] font-semibold text-white transition-colors hover:bg-[#0d8b60] disabled:cursor-not-allowed disabled:opacity-50 ${
          compact ? "px-3.5 py-2.5 text-xs" : "px-4 py-3 text-sm"
        }`}
      >
        <Download className="h-4 w-4" />
        <span>Excel/CSV Aktar</span>
      </button>
    </>
  );

  return (
    <div
      style={{ padding: isMobile ? 12 : isSmallPc ? 16 : 24 }}
      className="flex min-h-0 flex-1 flex-col"
    >
      {compact ? (
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Kayıtlı Hissedarlar
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Toplam {filtered.length} kayıt listeleniyor.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {controls}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Kayıtlı Hissedarlar
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Toplam {filtered.length} kayıt listeleniyor.
            </p>
          </div>
          <div className="flex items-center gap-3">{controls}</div>
        </div>
      )}

      <div className="h-6 shrink-0" />

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Users className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-base text-slate-400">Kayıt bulunamadı.</p>
          </div>
        ) : (
          <div className="h-full w-full overflow-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="h-[52px] border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
                  <th className="px-6">Müşteri</th>
                  <th className="px-6">Grup / Tür</th>
                  <th className="px-6">Not</th>
                  <th className="px-6">Adres</th>
                  <th className="px-6">Tarih</th>
                  <th className="px-6">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((reg) => {
                  const date = formatLocalDate(reg.createdAt);
                  const isDonation = reg.isDonation === true;
                  const isTekDuzen = reg.isTekDuzen === true;
                  const hasVekalet = reg.hasVekalet === true;
                  const regNameLower = (reg.name ?? "").trim().toLowerCase();

                  const assignedAnimals = service.animals.filter((animal) =>
                    (animal.shareholders ?? []).some(
                      (s) =>
                        (s.name ?? "").toString().trim().toLowerCase() ===
                        regNameLower,
                    ),
                  );

                  const assignedInfo =
                    assignedAnimals.length > 0
                      ? assignedAnimals
                          .map((a) => {
                            const k = (a.kesimNo ?? "").toString().trim();
                            return k ? `${k}. Kurban` : (a.name || "Kurbanlık");
                          })
                          .join(", ")
                      : null;

                  return (
                    <tr
                      key={reg.id}
                      className={`h-16 ${
                        isTekDuzen
                          ? "bg-[#ECFDF5]"
                          : hasVekalet
                            ? "bg-[#EFF6FF]"
                            : "bg-white hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Customer */}
                      <td className="px-6 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {reg.name}
                              </span>
                              {assignedInfo && (
                                <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                                  {assignedInfo}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 text-[13px] text-slate-500">
                              {reg.phone}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                service.updateRegistrationTekDuzen(
                                  reg.id,
                                  !isTekDuzen,
                                )
                              }
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
                              onClick={() =>
                                service.updateRegistrationVekalet(
                                  reg.id,
                                  !hasVekalet,
                                )
                              }
                              className={`flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border-[1.2px] text-[11px] font-black ${
                                hasVekalet
                                  ? "border-blue-600 bg-blue-500 text-white"
                                  : "border-slate-300 bg-white text-slate-500"
                              }`}
                            >
                              V
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Group / Type */}
                      <td className="px-6 py-2">
                        <span
                          className={`inline-block rounded-md border px-2 py-1 text-xs font-bold ${
                            isDonation
                              ? "border-amber-200 bg-amber-50 text-amber-800"
                              : "border-emerald-200 bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {isDonation ? "Bağış Hisse" : reg.group}
                        </span>
                        {reg.status === "pending" && (
                          <span className="ml-1.5 inline-block rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                            Onay Bekliyor
                          </span>
                        )}
                      </td>

                      {/* Note */}
                      <td className="px-6 py-2">
                        <div className="line-clamp-2 max-w-[150px] text-[13px] text-slate-800">
                          {reg.note || "-"}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-6 py-2">
                        <div
                          className={`line-clamp-2 max-w-[180px] text-[13px] ${
                            isDonation
                              ? "italic text-slate-400"
                              : "text-slate-700"
                          }`}
                        >
                          {isDonation ? "Bağış Teslim" : (reg.address || "-")}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-6 py-2 text-[13px] text-slate-600">
                        {date}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-2">
                        <div className="flex items-center gap-2">
                          {reg.status === "pending" && (
                            <button
                              type="button"
                              title="Başvuruyu Onayla"
                              onClick={async () => {
                                const ok = await service.approveRegistration(reg.id);
                                if (ok) toast.success(`"${reg.name}" başvurusu onaylandı, hisse atandı.`);
                                else
                                  toast.error(
                                    "Onaylanamadı: hisse artık dolu olabilir veya hayvan silinmiş.",
                                  );
                              }}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#0F9F6E] px-3 py-2 text-xs font-bold text-white hover:bg-[#0d8b60]"
                            >
                              <Check className="h-4 w-4" />
                              Onayla
                            </button>
                          )}
                          <button
                            type="button"
                            title="Kurbanlığa Ata"
                            onClick={() => setAssignReg(reg)}
                            className="cursor-pointer rounded-full bg-[#ECFDF5] p-2 text-[#0F9F6E] hover:bg-emerald-200/50"
                          >
                            <UserCheck className="h-[18px] w-[18px]" />
                          </button>
                          <button
                            type="button"
                            title="Kaydı Sil"
                            onClick={() =>
                              setDeleteTarget({ id: reg.id, name: reg.name })
                            }
                            className="cursor-pointer rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-200/50"
                          >
                            <Trash2 className="h-[18px] w-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              Kaydı Sil
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {`"${deleteTarget?.name ?? ""}" isimli hissedar kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
                await service.deleteRegistration(id);
                toast.success("Kayıt başarıyla silindi.");
              }}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
            >
              Sil
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Registration Dialog */}
      {assignReg && (
        <AssignRegistrationDialog
          reg={assignReg}
          animals={service.animals}
          onClose={() => setAssignReg(null)}
          onAssign={async (animal, slotIndex) => {
            await service.updateAnimalShareholder(
              animal.id,
              slotIndex,
              assignReg.name ?? "",
              assignReg.phone ?? "",
              { isTekDuzen: assignReg.isTekDuzen === true },
            );
            toast.success(
              `"${assignReg.name}" başarıyla "${animal.name}" kurbanlığına Hissedar ${slotIndex + 1} olarak atandı.`,
            );
          }}
        />
      )}
    </div>
  );
}

function AssignRegistrationDialog({
  reg,
  animals,
  onClose,
  onAssign,
}: {
  reg: Registration;
  animals: Animal[];
  onClose: () => void;
  onAssign: (animal: Animal, slotIndex: number) => Promise<void>;
}) {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>("");
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [confirmOverwrite, setConfirmOverwrite] = useState<string | null>(null);

  const selectedAnimal = animals.find((a) => a.id === selectedAnimalId) ?? null;
  const shareholders = selectedAnimal?.shareholders ?? [];

  const handleAnimalChange = (id: string | null) => {
    if (!id) return;
    setSelectedAnimalId(id);
    const animal = animals.find((a) => a.id === id);
    if (animal) {
      const emptyIdx = animal.shareholders.findIndex(
        (s) => !(s.name ?? "").trim(),
      );
      setSelectedSlotIndex(emptyIdx === -1 ? 0 : emptyIdx);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnimal) return;
    const sh = shareholders[selectedSlotIndex];
    const existingName = (sh?.name ?? "").trim();
    if (existingName && !confirmOverwrite) {
      setConfirmOverwrite(existingName);
      return;
    }
    onClose();
    await onAssign(selectedAnimal, selectedSlotIndex);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[480px] rounded-2xl p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-900">
            {`"${reg.name}" - Kurbanlığa Ata`}
          </DialogTitle>
        </DialogHeader>

        {confirmOverwrite ? (
          <div>
            <h4 className="font-bold text-slate-900">Hisse Dolu</h4>
            <p className="mt-2 text-sm text-slate-600">
              {`Seçtiğiniz hisse slotu şu anda "${confirmOverwrite}" adına kayıtlıdır. Üzerine yazıp değiştirmek istiyor musunuz?`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOverwrite(null)}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!selectedAnimal) return;
                  onClose();
                  await onAssign(selectedAnimal, selectedSlotIndex);
                }}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
              >
                Değiştir
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-2 space-y-4">
              <div className="text-[13px] font-bold text-slate-700">
                Talep Edilen Grup:{" "}
                {reg.isDonation ? "Bağış Hisse" : (reg.group || "-")}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Kurbanlık Hayvan Seçin:
                </label>
                <div className="mt-1.5">
                  <Select
                    value={selectedAnimalId || null}
                    onValueChange={handleAnimalChange}
                  >
                    <SelectTrigger className="!h-auto w-full rounded-xl border border-slate-300 px-3.5 py-3 text-[13px] font-semibold shadow-none">
                      <SelectValue placeholder="Bir kurbanlık seçin">
                        {selectedAnimal
                          ? `${selectedAnimal.name || "Kurbanlık"} (${selectedAnimal.group ?? ""}${selectedAnimal.earTag ? ` - ${selectedAnimal.earTag}` : ""})`
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {animals.map((a) => {
                        const label = `${a.name || "Kurbanlık"} (${a.group ?? ""}${a.earTag ? ` - ${a.earTag}` : ""})`;
                        return (
                          <SelectItem key={a.id} value={a.id}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedAnimal ? (
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Hisse Slotu Seçin:
                  </label>
                  <div className="mt-1.5">
                    <Select
                      value={String(selectedSlotIndex)}
                      onValueChange={(v) =>
                        v !== null && setSelectedSlotIndex(Number(v))
                      }
                    >
                      <SelectTrigger className="!h-auto w-full rounded-xl border border-slate-300 px-3.5 py-3 text-[13px] shadow-none">
                        <SelectValue>
                          {(() => {
                            const sh = shareholders[selectedSlotIndex];
                            const isEmpty = !(sh?.name ?? "").trim();
                            return `Hisse ${selectedSlotIndex + 1} - ${isEmpty ? "Boş" : sh.name}`;
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 7 }, (_, idx) => {
                          const sh = shareholders[idx];
                          const isEmpty = !(sh?.name ?? "").trim();
                          const label = `Hisse ${idx + 1} - ${isEmpty ? "Boş" : sh.name}`;
                          return (
                            <SelectItem
                              key={idx}
                              value={String(idx)}
                              className={
                                isEmpty
                                  ? "font-bold text-emerald-700"
                                  : "text-slate-500"
                              }
                            >
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3 text-center text-xs italic text-slate-500">
                  Hisse yuvalarını listelemek için lütfen yukarıdan bir
                  kurbanlık hayvan seçin.
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
                disabled={!selectedAnimal}
                onClick={handleSubmit}
                className="cursor-pointer rounded-[10px] bg-[#0F9F6E] px-5 py-2 text-sm font-bold text-white hover:bg-[#0d8b60] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ata
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

