"use client";

import { useSyncExternalStore } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { cloudinaryService } from "./cloudinary";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface Group {
  id: string;
  name: string;
  price: string;
  isSoldOut: boolean;
  isPopular: boolean;
  [key: string]: unknown;
}

export interface Faq {
  question: string;
  answer: string;
  [key: string]: unknown;
}

export interface Registration {
  id: string;
  name: string;
  phone: string;
  address: string;
  group: string;
  note: string;
  isDonation: boolean;
  isTekDuzen: boolean;
  hasVekalet: boolean;
  createdAt: string;
  /** Hisse başvurusu: başvurulan hayvan ve slot (0 tabanlı). */
  animalId?: string;
  slotIndex?: number;
  /** "pending" = yönetici onayı bekliyor. Tanımsız/"approved" = onaylı. */
  status?: "pending" | "approved";
  firestorePath?: string;
}

export const SIZE_GROUPS = ["Küçük Grup", "Orta Grup", "Büyük Grup"] as const;
export type SizeGroup = (typeof SIZE_GROUPS)[number];

export const PENDING_HOLD_DAYS = 14;

export function getPendingRemainingTime(createdAtIso: string | undefined): {
  isExpired: boolean;
  text: string;
  days: number;
  hours: number;
  minutes: number;
} {
  const created = createdAtIso ? new Date(createdAtIso).getTime() : Date.now();
  const deadline = created + PENDING_HOLD_DAYS * 24 * 60 * 60 * 1000;
  const diffMs = deadline - Date.now();

  if (diffMs <= 0) {
    return { isExpired: true, text: "Süre Doldu", days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let text = "";
  if (days >= 1) {
    text = `${days} gün ${hours} sa`;
  } else if (hours >= 1) {
    text = `${hours} sa ${minutes} dk`;
  } else {
    text = `${Math.max(1, minutes)} dk`;
  }

  return { isExpired: false, text, days, hours, minutes };
}

/** Hayvanın grubunu 3 boyut grubundan birine eşler (eski "1. Grup" kayıtları dahil). */
export function getSizeGroup(group: string | undefined | null): SizeGroup {
  const g = (group ?? "").toString().trim().toLowerCase();
  if (g.startsWith("küçük") || g.startsWith("kucuk") || g.startsWith("1.")) return "Küçük Grup";
  if (g.startsWith("orta") || g.startsWith("2.")) return "Orta Grup";
  if (g.startsWith("büyük") || g.startsWith("buyuk") || g.startsWith("3.") || g.startsWith("4."))
    return "Büyük Grup";
  return "Orta Grup";
}

export interface Shareholder {
  slot: number;
  name: string;
  phone: string;
  isTekDuzen: boolean;
  hasVekalet: boolean;
}

export interface Animal {
  id: string;
  name: string;
  earTag: string;
  group: string;
  kilogram: string;
  kesimNo: string;
  photoUrl: string;
  isSlaughtered: boolean;
  shareholders: Shareholder[];
  createdAt: string;
  firestorePath?: string;
}

export type MainPageTexts = Record<string, string>;

/* ------------------------------------------------------------------ */
/* Defaults                                                            */
/* ------------------------------------------------------------------ */

export const DEFAULT_GROUPS: Group[] = [
  { id: "1", name: "1. Grup", price: "30.000 - 35.000", isSoldOut: true, isPopular: false },
  { id: "2", name: "2. Grup", price: "35.000 - 40.000", isSoldOut: false, isPopular: true },
  { id: "3", name: "3. Grup", price: "40.000 - 45.000", isSoldOut: false, isPopular: false },
  { id: "4", name: "4. Grup", price: "45.000 ve üstü", isSoldOut: false, isPopular: false },
];

export const DEFAULT_FAQS: Faq[] = [
  {
    question: "Kurban hissesi nasıl ayrılır?",
    answer:
      "Web sitemiz üzerinden kayıt formunu doldurarak veya WhatsApp hattımızdan bize ulaşarak hissenizi ayırtabilirsiniz. Kayıt sonrasında size bilgilendirme mesajı gönderilecektir.",
  },
  {
    question: "Kesim ne zaman ve nerede yapılır?",
    answer:
      "Kesimler Kurban Bayramı'nın ilk günü sabah saatlerinde hijyenik tesislerimizde gerçekleştirilir. Tüm kesimler veteriner hekim gözetiminde ve İslami usullere uygun olarak yapılır.",
  },
  {
    question: "Etler ne zaman teslim edilir?",
    answer:
      "Etleriniz kesim sonrası hassas terazilerde eşit şekilde paylara ayrılır ve özel soğuk zincir ambalajlarında bayramın ilk günü adresinize teslim edilir.",
  },
  {
    question: "Bağış hisse nedir?",
    answer:
      "Bağış hisse, ihtiyaç sahibi ailelere, öğrencilere ve muhtaçlara ulaştırılmak üzere ayrılan kurban hissesidir. Bağış hisseniz güvenilir kurumlar aracılığıyla dağıtılır.",
  },
  {
    question: "Kurbanımı canlı olarak görebilir miyim?",
    answer:
      "Evet, kurbanınız küpe numarası ile eşleştirilir ve kesim öncesinde fotoğraf/video olarak tarafınıza gönderilir. Ayrıca sitemiz üzerinden de sorgulayabilirsiniz.",
  },
];

export const DEFAULT_MAIN_PAGE_TEXTS: MainPageTexts = {
  hero_badge: "2026 Kurban Kayıtlarımız Başladı",
  hero_title: "Kurbanınız\nEmin Ellerde",
  hero_subtitle:
    "İslami usullere uygun, hijyenik tesislerde, veteriner hekim kontrolünde güvenilir bir kurban ibadeti için hizmetinizdeyiz.",
  hero_btn_register: "Hemen Kayıt Ol",
  hero_btn_search: "Kurbanını Gör",

  features_badge: "Neden Biz?",
  features_title: "Neden Olimpik Kurban?",
  features_subtitle:
    "İbadetinizi en doğru, şeffaf ve güvenilir şekilde yerine getirmeniz için tüm süreci titizlikle yönetiyoruz.",
  feature_1_title: "Güvenli ve Şeffaf",
  feature_1_desc:
    "Kurbanlıklarımız veteriner hekim kontrolünde seçilir. Tüm süreçte sizinle şeffaf bir iletişim kurulur.",
  feature_2_title: "İslami Usul Kesim",
  feature_2_desc:
    "Tekbirlerle, İslami kaidelere tam riayet edilerek, işin ehli kasaplarımız tarafından kesim yapılır.",
  feature_3_title: "Eşit Paylama & Teslim",
  feature_3_desc:
    "Etleriniz hassas terazilerde eşit olarak pay edilir, özel ambalajlarında ilk gün teslim edilir.",

  search_title: "KURBANINI GÖR",
  search_subtitle: "Küpe numarası, isim veya telefon ile kurbanınızı sorgulayabilirsiniz.",
  search_placeholder: "Örn: TR-123456... veya Ad Soyad",
  search_btn: "Sorgula",
  search_error:
    "Sorgunuz için henüz bir sonuç bulunamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.",

  pricing_badge: "Fiyatlar",
  pricing_title: "Kurban Seçenekleri",
  pricing_subtitle: "Her bütçeye uygun olarak belirlenmiş, özenle seçilmiş kurban gruplarımız.",

  reg_title: "Kurban Kayıt Formu",
  reg_subtitle: "Hissenizi ayırtmak için bilgileri eksiksiz doldurun.",
  reg_donation_title: "Bağış Hisse Formu",
  reg_donation_subtitle: "Muhtaçlar için bağış hissenizi kaydedin.",
  reg_success_title: "Kaydınız Alındı!",
  reg_success_desc:
    "Kaydınız başarıyla oluşturuldu. En kısa sürede sizinle iletişime geçeceğiz.",

  faq_badge: "SSS",
  faq_title: "Sıkça Sorulan Sorular",
  faq_subtitle: "Aklınıza takılan soruların cevapları",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIRESTORE_PROJECT_ID || "olimpik-kurban-2026";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const FS_ROOT = "https://firestore.googleapis.com/v1/";

const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeShareholders(raw: any[] | undefined | null): Shareholder[] {
  const existing = new Map<number, any>();
  for (const s of raw ?? []) existing.set(Number(s?.slot ?? 0), s);
  return Array.from({ length: 7 }, (_, i) => {
    const slot = i + 1;
    const e = existing.get(slot);
    return {
      slot,
      name: e?.name ?? "",
      phone: e?.phone ?? "",
      isTekDuzen: e?.isTekDuzen ?? false,
      hasVekalet: e?.hasVekalet ?? false,
    };
  });
}

function emptyShareholders(): Shareholder[] {
  return normalizeShareholders([]);
}

function sortAnimalsList(list: Animal[]) {
  list.sort((a, b) => {
    const aNoStr = a.kesimNo?.toString() ?? "";
    const bNoStr = b.kesimNo?.toString() ?? "";
    const aNo = /^-?\d+$/.test(aNoStr.trim()) ? parseInt(aNoStr, 10) : null;
    const bNo = /^-?\d+$/.test(bNoStr.trim()) ? parseInt(bNoStr, 10) : null;

    if (aNo !== null && bNo !== null) return aNo - bNo;
    if (aNo !== null) return -1;
    if (bNo !== null) return 1;
    if (aNoStr && bNoStr) return aNoStr < bNoStr ? -1 : aNoStr > bNoStr ? 1 : 0;
    if (aNoStr) return -1;
    if (bNoStr) return 1;
    const aTime = a.createdAt ?? "";
    const bTime = b.createdAt ?? "";
    return bTime < aTime ? -1 : bTime > aTime ? 1 : 0;
  });
}

function registrationFields(reg: Registration) {
  return {
    id: { stringValue: reg.id },
    name: { stringValue: reg.name },
    phone: { stringValue: reg.phone },
    address: { stringValue: reg.address },
    group: { stringValue: reg.group },
    note: { stringValue: reg.note },
    isDonation: { booleanValue: reg.isDonation },
    isTekDuzen: { booleanValue: reg.isTekDuzen ?? false },
    hasVekalet: { booleanValue: reg.hasVekalet ?? false },
    createdAt: { stringValue: reg.createdAt },
    animalId: { stringValue: reg.animalId ?? "" },
    slotIndex: { integerValue: String(reg.slotIndex ?? -1) },
    status: { stringValue: reg.status ?? "approved" },
  };
}

function animalFields(animal: Animal) {
  return {
    id: { stringValue: animal.id },
    animalName: { stringValue: animal.name },
    earTag: { stringValue: animal.earTag },
    group: { stringValue: animal.group },
    kilogram: { stringValue: animal.kilogram ?? "" },
    kesimNo: { stringValue: animal.kesimNo ?? "" },
    photoUrl: { stringValue: animal.photoUrl ?? "" },
    isSlaughtered: { booleanValue: animal.isSlaughtered ?? false },
    shareholdersJson: { stringValue: JSON.stringify(animal.shareholders) },
    createdAt: { stringValue: animal.createdAt },
  };
}

const LS = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
};

/* ------------------------------------------------------------------ */
/* Service                                                             */
/* ------------------------------------------------------------------ */

type Listener = () => void;

/**
 * Flutter SiteDataService'in birebir TypeScript karşılığı.
 * Singleton; tüm sayfa ve bileşenler aynı örneği paylaşır.
 */
class SiteDataService {
  private listeners = new Set<Listener>();
  private _version = 0;
  private _initStarted = false;

  initialized = false;
  isFirestoreError = false;

  contactPhone = "0553 425 14 65";
  contactAddress = "İstanbul, Türkiye";

  adminUsername = "admin";
  adminPassword = "olimpik2026";
  isAdminLoggedIn = false;

  isLiveTrackingActive = false;

  groups: Group[] = DEFAULT_GROUPS.map((g) => ({ ...g }));
  faqs: Faq[] = DEFAULT_FAQS.map((f) => ({ ...f }));
  mainPageTexts: MainPageTexts = { ...DEFAULT_MAIN_PAGE_TEXTS };
  registrations: Registration[] = [];
  animals: Animal[] = [];

  cloudinaryCloudName = "";
  cloudinaryUploadPreset = "";

  /* ---------- reactivity ---------- */

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getVersion = () => this._version;

  notifyListeners() {
    this._version++;
    // Yeni referanslar ile React'in değişiklikleri algılamasını kolaylaştır
    this.groups = [...this.groups];
    this.faqs = [...this.faqs];
    this.registrations = [...this.registrations];
    this.animals = [...this.animals];
    this.mainPageTexts = { ...this.mainPageTexts };
    this.listeners.forEach((l) => l());
  }

  /* ---------- init ---------- */

  async init() {
    if (this._initStarted) return;
    this._initStarted = true;
    this.loadFromLocal();
    this.initialized = true;
    this.notifyListeners();
    await this.syncWithFirestore();
  }

  /* ---------- admin ---------- */

  login(username: string, password: string): boolean {
    if (username === this.adminUsername && password === this.adminPassword) {
      this.isAdminLoggedIn = true;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  logout() {
    this.isAdminLoggedIn = false;
    this.notifyListeners();
  }

  async updateConfig(args: {
    phone: string;
    address: string;
    username: string;
    password: string;
    newGroups: Group[];
  }) {
    this.contactPhone = args.phone;
    this.contactAddress = args.address;
    this.adminUsername = args.username;
    this.adminPassword = args.password;
    this.groups = args.newGroups;
    this.notifyListeners();
    this.saveToLocal();
    await this.saveConfigToFirestore();
  }

  async updateFaqs(newFaqs: Faq[]) {
    this.faqs = newFaqs;
    this.notifyListeners();
    this.saveToLocal();
    await this.saveConfigToFirestore();
  }

  async updateMainPageTexts(newTexts: MainPageTexts) {
    this.mainPageTexts = newTexts;
    this.notifyListeners();
    this.saveToLocal();
    await this.saveConfigToFirestore();
  }

  async updateLiveTrackingStatus(isActive: boolean) {
    this.isLiveTrackingActive = isActive;
    this.notifyListeners();
    this.saveToLocal();
    await this.saveConfigToFirestore();
  }

  async updateCloudinaryConfig({
    cloudName,
    uploadPreset,
  }: {
    cloudName: string;
    uploadPreset: string;
  }) {
    this.cloudinaryCloudName = cloudName;
    this.cloudinaryUploadPreset = uploadPreset;
    cloudinaryService.configure({ cloudName, uploadPreset });
    this.notifyListeners();
    this.saveToLocal();
    await this.saveConfigToFirestore();
  }

  /* ---------- registrations ---------- */

  async addRegistration(args: {
    name: string;
    phone: string;
    address: string;
    group: string;
    note: string;
    isDonation: boolean;
  }) {
    const now = new Date();
    const registration: Registration = {
      id: String(now.getTime()),
      name: args.name,
      phone: args.phone,
      address: args.address,
      group: args.group,
      note: args.note,
      isDonation: args.isDonation,
      isTekDuzen: false,
      hasVekalet: false,
      createdAt: now.toISOString(),
      status: "approved",
    };
    this.registrations.unshift(registration);
    this.notifyListeners();
    this.saveToLocal();
    await this.saveRegistrationToFirestore(registration);
  }

  /** Slot durumu: "empty" | "pending" (onay bekliyor) | "full" (dolu/rezerve). */
  getSlotStatus(animal: Animal, slotIndex: number): "empty" | "pending" | "full" {
    const sh = animal.shareholders[slotIndex];
    if (sh && (sh.name ?? "").trim()) return "full";
    const pending = this.getPendingRegistration(animal.id, slotIndex);
    return pending ? "pending" : "empty";
  }

  /** Hayvan ve slota ait bekleyen (pending) başvuruyu bulur (varsa). */
  getPendingRegistration(animalId: string, slotIndex: number): Registration | undefined {
    return this.registrations.find(
      (r) => r.status === "pending" && r.animalId === animalId && r.slotIndex === slotIndex,
    );
  }

  /**
   * Herkese açık hisse başvurusu. Slot boşsa "pending" kayıt oluşturur;
   * yönetici onaylayınca slota yazılır. Slot müsait değilse false döner.
   */
  async applyForShare(args: {
    animalId: string;
    slotIndex: number;
    name: string;
    phone: string;
  }): Promise<boolean> {
    // Çakışmayı azaltmak için güncel veriyi çek.
    await this.syncWithFirestore();
    const animal = this.animals.find((a) => a.id === args.animalId);
    if (!animal || animal.isSlaughtered) return false;
    if (this.getSlotStatus(animal, args.slotIndex) !== "empty") return false;

    const now = new Date();
    const registration: Registration = {
      id: String(now.getTime()),
      name: args.name,
      phone: args.phone,
      address: "",
      group: getSizeGroup(animal.group),
      note: `${animal.kesimNo ? `${animal.kesimNo}. Kurbanlık` : animal.name} - Hisse ${args.slotIndex + 1}${animal.earTag ? ` (Küpe: ${animal.earTag})` : ""}`,
      isDonation: false,
      isTekDuzen: false,
      hasVekalet: false,
      createdAt: now.toISOString(),
      animalId: animal.id,
      slotIndex: args.slotIndex,
      status: "pending",
    };
    this.registrations.unshift(registration);
    this.notifyListeners();
    this.saveToLocal();
    await this.saveRegistrationToFirestore(registration);
    return true;
  }

  /** Bekleyen başvuruyu onaylar: hisseyi hayvana yazar, kaydı onaylı yapar. */
  async approveRegistration(id: string): Promise<boolean> {
    const reg = this.registrations.find((r) => r.id === id);
    if (!reg || !reg.animalId || reg.slotIndex === undefined) return false;
    const animal = this.animals.find((a) => a.id === reg.animalId);
    if (!animal) return false;
    const current = animal.shareholders[reg.slotIndex];
    if (current && (current.name ?? "").trim()) return false; // slot başkasına verilmiş

    await this.updateAnimalShareholder(animal.id, reg.slotIndex, reg.name, reg.phone);
    reg.status = "approved";
    this.notifyListeners();
    this.saveToLocal();
    if (reg.firestorePath) await this.updateRegistrationInFirestore(reg);
    return true;
  }

  /** Yöneticinin doğrudan hisse rezerve etmesi (ana ekranda "Dolu" görünür). */
  reserveSlot(animalId: string, slotIndex: number, label = "Rezerve") {
    return this.updateAnimalShareholder(animalId, slotIndex, label, "");
  }

  async deleteRegistration(id: string) {
    const reg = this.registrations.find((r) => r.id === id);
    this.registrations = this.registrations.filter((r) => r.id !== id);
    this.notifyListeners();
    this.saveToLocal();
    if (reg?.firestorePath) {
      await this.deleteDocFromFirestore(reg.firestorePath, "registration");
    } else {
      await this.syncWithFirestore();
    }
  }

  private async propagateFlag(
    id: string,
    key: "isTekDuzen" | "hasVekalet",
    value: boolean,
  ) {
    const idx = this.registrations.findIndex((r) => r.id === id);
    if (idx === -1) return;
    this.registrations[idx][key] = value;
    const name = norm(this.registrations[idx].name);

    for (let i = 0; i < this.registrations.length; i++) {
      if (i !== idx && norm(this.registrations[i].name) === name) {
        this.registrations[i][key] = value;
      }
    }

    const modifiedAnimals: Animal[] = [];
    for (const animal of this.animals) {
      let modified = false;
      const shs = animal.shareholders.map((s) => ({ ...s }));
      for (const s of shs) {
        if (norm(s.name) === name && s[key] !== value) {
          s[key] = value;
          modified = true;
        }
      }
      if (modified) {
        animal.shareholders = shs;
        modifiedAnimals.push(animal);
      }
    }

    this.notifyListeners();
    this.saveToLocal();

    for (const r of this.registrations) {
      if (norm(r.name) === name && r.firestorePath) {
        await this.updateRegistrationInFirestore(r);
      }
    }
    for (const a of modifiedAnimals) await this.updateAnimalInFirestore(a);
  }

  updateRegistrationTekDuzen(id: string, isTekDuzen: boolean) {
    return this.propagateFlag(id, "isTekDuzen", isTekDuzen);
  }

  updateRegistrationVekalet(id: string, hasVekalet: boolean) {
    return this.propagateFlag(id, "hasVekalet", hasVekalet);
  }

  /* ---------- animals ---------- */

  async addAnimal(args: {
    name: string;
    earTag: string;
    group: string;
    kilogram: string;
    kesimNo: string;
  }) {
    const now = new Date();
    const animal: Animal = {
      id: String(now.getTime()),
      name: args.name,
      earTag: args.earTag,
      group: args.group,
      kilogram: args.kilogram,
      kesimNo: args.kesimNo,
      photoUrl: "",
      isSlaughtered: false,
      shareholders: emptyShareholders(),
      createdAt: now.toISOString(),
    };
    this.animals.unshift(animal);
    sortAnimalsList(this.animals);
    this.notifyListeners();
    this.saveToLocal();
    await this.saveAnimalToFirestore(animal);
  }

  async updateAnimalDetails(args: {
    animalId: string;
    name: string;
    earTag: string;
    group: string;
    kilogram: string;
    kesimNo: string;
  }) {
    const animal = this.animals.find((a) => a.id === args.animalId);
    if (!animal) return;
    animal.name = args.name;
    animal.earTag = args.earTag;
    animal.group = args.group;
    animal.kilogram = args.kilogram;
    animal.kesimNo = args.kesimNo;
    sortAnimalsList(this.animals);
    this.notifyListeners();
    this.saveToLocal();
    await this.updateAnimalInFirestore(animal);
  }

  async updateAnimalPhoto(animalId: string, photoUrl: string) {
    const animal = this.animals.find((a) => a.id === animalId);
    if (!animal) return;
    animal.photoUrl = photoUrl;
    this.notifyListeners();
    this.saveToLocal();
    await this.updateAnimalInFirestore(animal);
  }

  async updateAnimalSlaughterStatus(animalId: string, isSlaughtered: boolean) {
    const animal = this.animals.find((a) => a.id === animalId);
    if (!animal) return;
    animal.isSlaughtered = isSlaughtered;
    this.notifyListeners();
    this.saveToLocal();
    await this.updateAnimalInFirestore(animal);
  }

  async updateAnimalShareholder(
    animalId: string,
    slotIndex: number,
    name: string,
    phone: string,
    opts: { isTekDuzen?: boolean; hasVekalet?: boolean } = {},
  ) {
    const idx = this.animals.findIndex((a) => a.id === animalId);
    if (idx === -1) return;
    const target = this.animals[idx];
    const shareholders = target.shareholders.map((s) => ({ ...s }));
    shareholders[slotIndex].name = name;
    shareholders[slotIndex].phone = phone;

    const n = norm(name);

    let targetTekDuzen = opts.isTekDuzen ?? false;
    if (opts.isTekDuzen === undefined && n) {
      const reg = this.registrations.some((r) => norm(r.name) === n && r.isTekDuzen === true);
      const slot = this.animals.some((a) =>
        a.shareholders.some((s) => norm(s.name) === n && s.isTekDuzen === true),
      );
      targetTekDuzen = reg || slot;
    }

    let targetVekalet = opts.hasVekalet ?? false;
    if (opts.hasVekalet === undefined && n) {
      const reg = this.registrations.some((r) => norm(r.name) === n && r.hasVekalet === true);
      const slot = this.animals.some((a) =>
        a.shareholders.some((s) => norm(s.name) === n && s.hasVekalet === true),
      );
      targetVekalet = reg || slot;
    }

    shareholders[slotIndex].isTekDuzen = targetTekDuzen;
    shareholders[slotIndex].hasVekalet = targetVekalet;
    target.shareholders = shareholders;

    for (const r of this.registrations) {
      if (norm(r.name) === n) {
        r.isTekDuzen = targetTekDuzen;
        r.hasVekalet = targetVekalet;
      }
    }

    const modifiedAnimals: Animal[] = [target];
    this.animals.forEach((animal, i) => {
      if (i === idx) return;
      let modified = false;
      const shs = animal.shareholders.map((s) => ({ ...s }));
      for (const s of shs) {
        if (norm(s.name) === n) {
          if (s.isTekDuzen !== targetTekDuzen) {
            s.isTekDuzen = targetTekDuzen;
            modified = true;
          }
          if (s.hasVekalet !== targetVekalet) {
            s.hasVekalet = targetVekalet;
            modified = true;
          }
        }
      }
      if (modified) {
        animal.shareholders = shs;
        modifiedAnimals.push(animal);
      }
    });

    this.notifyListeners();
    this.saveToLocal();

    for (const r of this.registrations) {
      if (norm(r.name) === n && r.firestorePath) {
        await this.updateRegistrationInFirestore(r);
      }
    }
    for (const a of modifiedAnimals) await this.updateAnimalInFirestore(a);
  }

  removeAnimalShareholder(animalId: string, slotIndex: number) {
    return this.updateAnimalShareholder(animalId, slotIndex, "", "");
  }

  async deleteAnimal(id: string) {
    const animal = this.animals.find((a) => a.id === id);
    this.animals = this.animals.filter((a) => a.id !== id);
    this.notifyListeners();
    this.saveToLocal();
    if (animal?.firestorePath) {
      await this.deleteDocFromFirestore(animal.firestorePath, "animal");
    } else {
      await this.syncWithFirestore();
    }
  }

  /* ---------- local persistence ---------- */

  private loadFromLocal() {
    try {
      this.contactPhone = LS.get("contact_phone") ?? this.contactPhone;
      this.contactAddress = LS.get("contact_address") ?? this.contactAddress;
      this.adminUsername = LS.get("admin_username") ?? this.adminUsername;
      this.adminPassword = LS.get("admin_password") ?? this.adminPassword;
      this.isLiveTrackingActive = LS.get("is_live_tracking_active") === "true";

      const groups = LS.get("groups_data");
      if (groups) this.groups = JSON.parse(groups);

      const faqs = LS.get("faqs_data");
      if (faqs) this.faqs = JSON.parse(faqs);

      const texts = LS.get("main_page_texts");
      if (texts) this.mainPageTexts = JSON.parse(texts);

      const regs = LS.get("regs_data");
      if (regs) {
        this.registrations = (JSON.parse(regs) as any[]).map((r) => ({
          ...r,
          isTekDuzen: r.isTekDuzen ?? false,
          hasVekalet: r.hasVekalet ?? false,
        }));
      }

      const animals = LS.get("animals_data");
      if (animals) {
        this.animals = (JSON.parse(animals) as any[]).map((a) => ({
          ...a,
          isSlaughtered: a.isSlaughtered ?? false,
          shareholders: normalizeShareholders(a.shareholders),
        }));
        sortAnimalsList(this.animals);
      }

      this.cloudinaryCloudName = LS.get("cloudinary_cloud_name") ?? "";
      this.cloudinaryUploadPreset = LS.get("cloudinary_upload_preset") ?? "";
      if (this.cloudinaryCloudName && this.cloudinaryUploadPreset) {
        cloudinaryService.configure({
          cloudName: this.cloudinaryCloudName,
          uploadPreset: this.cloudinaryUploadPreset,
        });
      }
    } catch (e) {
      console.error("Local load error:", e);
    }
  }

  private saveToLocal() {
    try {
      LS.set("contact_phone", this.contactPhone);
      LS.set("contact_address", this.contactAddress);
      LS.set("admin_username", this.adminUsername);
      LS.set("admin_password", this.adminPassword);
      LS.set("is_live_tracking_active", String(this.isLiveTrackingActive));
      LS.set("groups_data", JSON.stringify(this.groups));
      LS.set("faqs_data", JSON.stringify(this.faqs));
      LS.set("main_page_texts", JSON.stringify(this.mainPageTexts));
      LS.set("regs_data", JSON.stringify(this.registrations));
      LS.set("animals_data", JSON.stringify(this.animals));
      LS.set("cloudinary_cloud_name", this.cloudinaryCloudName);
      LS.set("cloudinary_upload_preset", this.cloudinaryUploadPreset);
    } catch (e) {
      console.error("Local save error:", e);
    }
  }

  /* ---------- firestore realtime listener ---------- */
  listenRealtime() {
    if (typeof window === "undefined") return () => {};

    try {
      const unsubAnimals = onSnapshot(
        collection(db, "animals"),
        (snapshot: any) => {
          if (!snapshot.empty) {
            const list: Animal[] = [];
            snapshot.forEach((d: any) => {
              const data = d.data() as any;
              list.push({
                id: d.id,
                name: data.name ?? "",
                earTag: data.earTag ?? "",
                group: data.group ?? "",
                kilogram: data.kilogram ?? "",
                kesimNo: data.kesimNo ?? "",
                photoUrl: data.photoUrl ?? "",
                isSlaughtered: data.isSlaughtered ?? false,
                shareholders: normalizeShareholders(data.shareholders),
                createdAt: data.createdAt ?? new Date().toISOString(),
                firestorePath: `projects/${PROJECT_ID}/databases/(default)/documents/animals/${d.id}`,
              });
            });
            this.animals = list;
            this.isFirestoreError = false;
            this.saveToLocal();
            this.notifyListeners();
          }
        },
        (error: any) => {
          console.warn("Firestore animals listener warning (falling back to REST):", error);
        }
      );

      return () => {
        unsubAnimals();
      };
    } catch (err) {
      console.warn("Realtime listener setup error:", err);
      return () => {};
    }
  }

  /* ---------- firestore ---------- */

  async syncWithFirestore() {
    try {
      // 1. Config
      const configRes = await fetch(`${BASE_URL}/config/site`, { cache: "no-store" });
      if (configRes.status === 200) {
        const body = await configRes.json();
        const f = body.fields ?? {};
        if (f.contactPhone) this.contactPhone = f.contactPhone.stringValue;
        if (f.contactAddress) this.contactAddress = f.contactAddress.stringValue;
        if (f.username) this.adminUsername = f.username.stringValue;
        if (f.password) this.adminPassword = f.password.stringValue;
        if (f.isLiveTrackingActive)
          this.isLiveTrackingActive = f.isLiveTrackingActive.booleanValue ?? false;
        if (f.groupsJson) this.groups = JSON.parse(f.groupsJson.stringValue);
        if (f.faqsJson) this.faqs = JSON.parse(f.faqsJson.stringValue);
        if (f.mainPageTextsJson)
          this.mainPageTexts = JSON.parse(f.mainPageTextsJson.stringValue);
        if (f.cloudinaryCloudName)
          this.cloudinaryCloudName = f.cloudinaryCloudName.stringValue ?? "";
        if (f.cloudinaryUploadPreset)
          this.cloudinaryUploadPreset = f.cloudinaryUploadPreset.stringValue ?? "";
        if (this.cloudinaryCloudName && this.cloudinaryUploadPreset) {
          cloudinaryService.configure({
            cloudName: this.cloudinaryCloudName,
            uploadPreset: this.cloudinaryUploadPreset,
          });
        }
        this.isFirestoreError = false;
      } else if (configRes.status === 404) {
        await this.saveConfigToFirestore();
      } else {
        this.isFirestoreError = true;
      }

      // 2. Registrations
      const regRes = await fetch(`${BASE_URL}/registrations?pageSize=100`, { cache: "no-store" });
      if (regRes.status === 200) {
        const body = await regRes.json();
        const docs: any[] = body.documents ?? [];
        const loaded: Registration[] = docs.map((doc) => {
          const f = doc.fields ?? {};
          const name = doc.name as string;
          return {
            firestorePath: name,
            id: f.id?.stringValue ?? name.split("/").pop()!,
            name: f.name?.stringValue ?? "",
            phone: f.phone?.stringValue ?? "",
            address: f.address?.stringValue ?? "",
            group: f.group?.stringValue ?? "",
            note: f.note?.stringValue ?? "",
            isDonation: f.isDonation?.booleanValue ?? false,
            isTekDuzen: f.isTekDuzen?.booleanValue ?? false,
            hasVekalet: f.hasVekalet?.booleanValue ?? false,
            createdAt: f.createdAt?.stringValue ?? "",
            animalId: f.animalId?.stringValue || undefined,
            slotIndex:
              f.slotIndex?.integerValue !== undefined && Number(f.slotIndex.integerValue) >= 0
                ? Number(f.slotIndex.integerValue)
                : undefined,
            status: (f.status?.stringValue as "pending" | "approved" | undefined) ?? "approved",
          };
        });
        loaded.sort((a, b) => (b.createdAt < a.createdAt ? -1 : b.createdAt > a.createdAt ? 1 : 0));
        this.registrations = loaded;
        this.isFirestoreError = false;
      } else if (regRes.status === 404) {
        this.registrations = [];
      } else {
        console.error("Firestore fetch registrations failed:", regRes.status);
        this.isFirestoreError = true;
      }

      // 3. Animals
      const animalsRes = await fetch(`${BASE_URL}/animals?pageSize=200`, { cache: "no-store" });
      if (animalsRes.status === 200) {
        const body = await animalsRes.json();
        const docs: any[] = body.documents ?? [];
        const loaded: Animal[] = docs.map((doc) => {
          const f = doc.fields ?? {};
          const name = doc.name as string;
          let rawSh: any[] = [];
          if (f.shareholdersJson) {
            try {
              rawSh = JSON.parse(f.shareholdersJson.stringValue);
            } catch (e) {
              console.error("Error parsing shareholdersJson:", e);
            }
          }
          return {
            firestorePath: name,
            id: f.id?.stringValue ?? name.split("/").pop()!,
            name: f.animalName?.stringValue ?? "",
            earTag: f.earTag?.stringValue ?? "",
            group: f.group?.stringValue ?? "",
            photoUrl: f.photoUrl?.stringValue ?? "",
            kilogram: f.kilogram?.stringValue ?? "",
            kesimNo: f.kesimNo?.stringValue ?? "",
            isSlaughtered: f.isSlaughtered?.booleanValue ?? false,
            shareholders: normalizeShareholders(rawSh),
            createdAt: f.createdAt?.stringValue ?? "",
          };
        });
        sortAnimalsList(loaded);
        this.animals = loaded;
        this.isFirestoreError = false;
      } else if (animalsRes.status === 404) {
        this.animals = [];
      } else {
        console.error("Firestore fetch animals failed:", animalsRes.status);
        this.isFirestoreError = true;
      }

      this.saveToLocal();
      this.notifyListeners();
    } catch (e) {
      console.error("Firestore sync error:", e);
      this.isFirestoreError = true;
      this.notifyListeners();
    }
  }

  private async saveConfigToFirestore() {
    try {
      const body = {
        fields: {
          contactPhone: { stringValue: this.contactPhone },
          contactAddress: { stringValue: this.contactAddress },
          username: { stringValue: this.adminUsername },
          password: { stringValue: this.adminPassword },
          groupsJson: { stringValue: JSON.stringify(this.groups) },
          faqsJson: { stringValue: JSON.stringify(this.faqs) },
          mainPageTextsJson: { stringValue: JSON.stringify(this.mainPageTexts) },
          cloudinaryCloudName: { stringValue: this.cloudinaryCloudName },
          cloudinaryUploadPreset: { stringValue: this.cloudinaryUploadPreset },
          isLiveTrackingActive: { booleanValue: this.isLiveTrackingActive },
        },
      };
      const res = await fetch(`${BASE_URL}/config/site`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      this.isFirestoreError = res.status !== 200;
      if (this.isFirestoreError) console.error("Firestore save config failed:", res.status);
      this.notifyListeners();
    } catch (e) {
      console.error("Firestore save config error:", e);
      this.isFirestoreError = true;
      this.notifyListeners();
    }
  }

  private async saveRegistrationToFirestore(reg: Registration) {
    try {
      const res = await fetch(`${BASE_URL}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: registrationFields(reg) }),
      });
      if (res.status === 200 || res.status === 201) {
        this.isFirestoreError = false;
        const resBody = await res.json();
        reg.firestorePath = resBody.name;
        this.saveToLocal();
      } else {
        console.error("Firestore save registration failed:", res.status);
        this.isFirestoreError = true;
      }
      this.notifyListeners();
    } catch (e) {
      console.error("Firestore save registration error:", e);
      this.isFirestoreError = true;
      this.notifyListeners();
    }
  }

  private async updateRegistrationInFirestore(reg: Registration) {
    try {
      const res = await fetch(`${FS_ROOT}${reg.firestorePath}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: registrationFields(reg) }),
      });
      this.isFirestoreError = res.status !== 200;
      this.notifyListeners();
    } catch (e) {
      console.error("Firestore update registration error:", e);
      this.isFirestoreError = true;
      this.notifyListeners();
    }
  }

  private async saveAnimalToFirestore(animal: Animal) {
    try {
      const res = await fetch(`${BASE_URL}/animals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: animalFields(animal) }),
      });
      if (res.status === 200 || res.status === 201) {
        this.isFirestoreError = false;
        const resBody = await res.json();
        animal.firestorePath = resBody.name;
        this.saveToLocal();
      } else {
        console.error("Firestore save animal failed:", res.status);
        this.isFirestoreError = true;
      }
      this.notifyListeners();
    } catch (e) {
      console.error("Firestore save animal error:", e);
      this.isFirestoreError = true;
      this.notifyListeners();
    }
  }

  private async updateAnimalInFirestore(animal: Animal) {
    try {
      if (!animal.firestorePath) {
        await this.saveAnimalToFirestore(animal);
        return;
      }
      const res = await fetch(`${FS_ROOT}${animal.firestorePath}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: animalFields(animal) }),
      });
      this.isFirestoreError = res.status !== 200;
      this.notifyListeners();
    } catch (e) {
      console.error("Firestore update animal error:", e);
      this.isFirestoreError = true;
      this.notifyListeners();
    }
  }

  private async deleteDocFromFirestore(docPath: string, label: string) {
    try {
      const res = await fetch(`${FS_ROOT}${docPath}`, { method: "DELETE" });
      this.isFirestoreError = res.status !== 200;
      if (this.isFirestoreError) console.error(`Firestore delete ${label} failed:`, res.status);
      this.notifyListeners();
    } catch (e) {
      console.error(`Firestore delete ${label} error:`, e);
      this.isFirestoreError = true;
      this.notifyListeners();
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const siteData = new SiteDataService();
export type { SiteDataService };

/**
 * Servisteki her değişiklikte bileşeni yeniden render eder ve servisi döndürür.
 * (Flutter'daki ListenableBuilder karşılığı)
 */
export function useSiteData(): SiteDataService {
  useSyncExternalStore(siteData.subscribe, siteData.getVersion, () => 0);
  return siteData;
}

