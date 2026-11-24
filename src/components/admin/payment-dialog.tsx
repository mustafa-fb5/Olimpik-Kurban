"use client";

import { useState } from "react";
import { Banknote, Printer, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Animal, PaymentInstallment, Shareholder } from "@/lib/site-data";

interface PaymentDialogProps {
  animal: Animal;
  slotIndex: number;
  shareholder: Shareholder;
  onClose: () => void;
  onSave: (
    totalAmount: number,
    payments: (PaymentInstallment | null)[],
  ) => Promise<void>;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const formatTL = (val: number) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val) + " ₺";

const formatDateTR = (iso: string) => {
  if (!iso) return new Date().toLocaleDateString("tr-TR");
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("tr-TR");
};

export function PaymentDialog({
  animal,
  slotIndex,
  shareholder,
  onClose,
  onSave,
}: PaymentDialogProps) {
  const [totalAmount, setTotalAmount] = useState<string>(
    shareholder.totalAmount ? String(shareholder.totalAmount) : "",
  );

  const initialPayments = [0, 1, 2].map((idx) => {
    const p = shareholder.payments?.[idx];
    return {
      amount: p?.amount ? String(p.amount) : "",
      date: p?.date || todayStr(),
    };
  });

  const [installments, setInstallments] = useState(initialPayments);
  const [saving, setSaving] = useState(false);

  const totalNum = Math.max(0, Number(totalAmount) || 0);
  const paidNum = installments.reduce(
    (sum, item) => sum + Math.max(0, Number(item.amount) || 0),
    0,
  );
  const remainingNum = Math.max(0, totalNum - paidNum);

  const updateInstallment = (
    idx: number,
    field: "amount" | "date",
    value: string,
  ) => {
    setInstallments((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized: (PaymentInstallment | null)[] = installments.map(
        (item) => {
          const amt = Number(item.amount) || 0;
          return amt > 0 ? { amount: amt, date: item.date || todayStr() } : null;
        },
      );
      await onSave(totalNum, normalized);
      toast.success("Ödeme bilgileri kaydedildi.");
      onClose();
    } catch {
      toast.error("Ödeme kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrintReceipt = (idx: number) => {
    const item = installments[idx];
    const amt = Number(item.amount) || 0;
    if (amt <= 0) {
      toast.warning("Makbuz yazdırmak için önce ödeme tutarı girin.");
      return;
    }

    const win = window.open("", "_blank", "width=460,height=640");
    if (!win) {
      toast.error("Açılır pencere engellendi. Lütfen izin verin.");
      return;
    }

    const animalLabel = animal.kesimNo
      ? `Sıra No: ${animal.kesimNo}`
      : animal.name || "Kurbanlık";

    win.document.write(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>Ödeme Makbuzu - ${shareholder.name}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 28px; color: #0f172a; }
    .box { border: 2px solid #0f172a; border-radius: 12px; padding: 20px; max-width: 380px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 16px; }
    .title { font-size: 18px; font-weight: 800; margin: 0; }
    .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
    .label { color: #475569; font-weight: 600; }
    .val { font-weight: 700; text-align: right; }
    .amount-box { background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 12px; text-align: center; margin: 16px 0; }
    .amount-label { font-size: 11px; color: #047857; font-weight: 700; text-transform: uppercase; }
    .amount-val { font-size: 22px; font-weight: 800; color: #065f46; margin-top: 4px; }
    .footer { border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 16px; font-size: 11px; color: #64748b; text-align: center; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="box">
    <div class="header">
      <h1 class="title">OLİMPİK KURBAN</h1>
      <div class="sub">Ödeme Makbuzu (${idx + 1}. Ödeme)</div>
    </div>
    <div class="row"><span class="label">Ad Soyad:</span><span class="val">${shareholder.name}</span></div>
    <div class="row"><span class="label">Telefon:</span><span class="val">${shareholder.phone || "-"}</span></div>
    <div class="row"><span class="label">Kurbanlık / Hisse:</span><span class="val">${animalLabel} — Hisse ${slotIndex + 1}</span></div>
    <div class="row"><span class="label">Ödeme Tarihi:</span><span class="val">${formatDateTR(item.date)}</span></div>
    <div class="amount-box">
      <div class="amount-label">Ödenen Miktar</div>
      <div class="amount-val">${formatTL(amt)}</div>
    </div>
    <div class="row"><span class="label">Toplam Hisse Tutarı:</span><span class="val">${formatTL(totalNum)}</span></div>
    <div class="row"><span class="label">Kalan Tutar:</span><span class="val">${formatTL(remainingNum)}</span></div>
    <div class="footer">Teşekkür ederiz. Allah kabul etsin.</div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`);
    win.document.close();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[460px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-extrabold text-slate-900">
            <Banknote className="h-5 w-5 text-emerald-600" />
            <span>Ödeme Takibi — Hisse {slotIndex + 1}</span>
          </DialogTitle>
          <p className="text-xs font-medium text-slate-500">
            {shareholder.name}
            {shareholder.phone ? ` • ${shareholder.phone}` : ""}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ödenecek Tutar */}
          <div>
            <label className="text-xs font-bold text-slate-700">
              Ödenecek Tutar (₺)
            </label>
            <Input
              type="number"
              min={0}
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Örn: 35000"
              className="mt-1 font-bold"
            />
          </div>

          {/* Özet */}
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
            <div>
              <div className="text-[10px] font-semibold text-slate-500">
                Toplam
              </div>
              <div className="text-xs font-extrabold text-slate-800">
                {formatTL(totalNum)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-emerald-600">
                Ödenen
              </div>
              <div className="text-xs font-extrabold text-emerald-700">
                {formatTL(paidNum)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-amber-600">
                Kalan Tutar
              </div>
              <div className="text-xs font-extrabold text-amber-700">
                {formatTL(remainingNum)}
              </div>
            </div>
          </div>

          {/* 1., 2., 3. Ödeme */}
          <div className="space-y-2.5">
            {installments.map((item, idx) => {
              const hasAmount = (Number(item.amount) || 0) > 0;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {idx + 1}. Ödeme
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePrintReceipt(idx)}
                      disabled={!hasAmount}
                      className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Makbuz Yazdır</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={item.amount}
                      onChange={(e) =>
                        updateInstallment(idx, "amount", e.target.value)
                      }
                      placeholder="Tutar (₺)"
                      className="h-9 text-xs font-semibold"
                    />
                    <Input
                      type="date"
                      value={item.date}
                      onChange={(e) =>
                        updateInstallment(idx, "date", e.target.value)
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Kapat
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Kaydediliyor..." : "Kaydet"}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
