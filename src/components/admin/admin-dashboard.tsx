"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  FileEdit,
  HelpCircle,
  KeyRound,
  LockOpen,
  LogOut,
  Menu,
  PawPrint,
  RefreshCw,
  Settings,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSiteData } from "@/lib/site-data";
import { useWindowWidth } from "./use-window-size";
import { AnimalsTab } from "./animals-tab";
import { RegistrationsTab } from "./registrations-tab";
import { SiteConfigTab } from "./site-config-tab";
import { FaqEditorTab } from "./faq-editor-tab";
import { MainPageTextsTab } from "./main-page-texts-tab";

const NAV_ITEMS: { index: number; title: string; icon: LucideIcon }[] = [
  { index: 0, title: "Kurbanlıklar", icon: PawPrint },
  { index: 1, title: "Hissedarlar", icon: Users },
  { index: 2, title: "Site Ayarları", icon: Settings },
  { index: 3, title: "SSS Yönetimi", icon: HelpCircle },
  { index: 4, title: "Ana Sayfa Yazıları", icon: FileEdit },
];

function getTabTitle(activeTab: number) {
  switch (activeTab) {
    case 0:
      return "Kurbanlıklar";
    case 1:
      return "Kayıtlı Hissedarlar";
    case 2:
      return "Site Ayarları";
    case 3:
      return "SSS Yönetimi";
    case 4:
      return "Ana Sayfa Yazıları";
    default:
      return "Yönetim Paneli";
  }
}

export function AdminDashboard() {
  const router = useRouter();
  const service = useSiteData();
  const width = useWindowWidth();

  const [activeTab, setActiveTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const errs: typeof fieldErrors = {};
    if (!username) errs.username = "Gerekli";
    if (!password) errs.password = "Gerekli";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const ok = service.login(username.trim(), password.trim());
    if (ok) {
      setUsername("");
      setPassword("");
    } else {
      setLoginError("Kullanıcı adı veya şifre hatalı!");
    }
  };

  if (!service.isAdminLoggedIn) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-900 p-6">
        <div className="w-full max-w-[420px] rounded-[28px] border border-slate-800/10 bg-white p-10 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <form onSubmit={handleLogin} noValidate>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-r from-[#0F9F6E] to-emerald-500">
                <LockOpen className="h-[30px] w-[30px] text-white" />
              </div>
            </div>

            <h1 className="mt-6 text-center text-2xl font-extrabold text-slate-900">
              Yönetici Girişi
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500">
              Devam etmek için giriş yapınız.
            </p>

            <div className="mt-8">
              {loginError && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="h-[18px] w-[18px] shrink-0 text-red-500" />
                  <span className="text-[13px] font-semibold text-red-600">
                    {loginError}
                  </span>
                </div>
              )}

              <div>
                <label className="text-[13px] font-semibold text-slate-700">
                  Kullanıcı Adı
                </label>
                <div
                  className={`mt-1.5 flex items-center rounded-xl border bg-slate-50 focus-within:border-[#0F9F6E] ${
                    fieldErrors.username ? "border-red-400" : "border-slate-200"
                  }`}
                >
                  <User className="ml-3 h-5 w-5 text-slate-500" />
                  <Input
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (fieldErrors.username)
                        setFieldErrors((p) => ({ ...p, username: undefined }));
                    }}
                    placeholder="admin"
                    className="h-auto border-0 bg-transparent px-3 py-3 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
                {fieldErrors.username && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <label className="text-[13px] font-semibold text-slate-700">
                  Şifre
                </label>
                <div
                  className={`mt-1.5 flex items-center rounded-xl border bg-slate-50 focus-within:border-[#0F9F6E] ${
                    fieldErrors.password ? "border-red-400" : "border-slate-200"
                  }`}
                >
                  <KeyRound className="ml-3 h-5 w-5 text-slate-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password)
                        setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    placeholder="••••••••"
                    className="h-auto border-0 bg-transparent px-3 py-3 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="mt-8 flex h-[52px] w-full cursor-pointer items-center justify-center rounded-xl bg-[#0F9F6E] text-[15px] font-bold text-white transition-colors hover:bg-[#0d8b60]"
              >
                Giriş Yap
              </button>

              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Siteye Geri Dön</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const isMobile = width < 850;
  const isSmallPc = width >= 850 && width < 1280;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F8F5]">
      {/* Mobile Drawer */}
      {isMobile && drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[280px] flex-col bg-[#032B20]">
            <SidebarContents
              activeTab={activeTab}
              isSmallPc={false}
              onSelect={(idx) => {
                setActiveTab(idx);
                setDrawerOpen(false);
              }}
            />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          style={{
            width: isSmallPc ? 220 : 260,
            marginLeft: isSmallPc ? 12 : 24,
          }}
          className="my-6 mr-3 flex shrink-0 flex-col rounded-3xl bg-[#032B20] shadow-[0_8px_20px_rgba(3,43,32,0.15)]"
        >
          <SidebarContents
            activeTab={activeTab}
            isSmallPc={isSmallPc}
            onSelect={(idx) => setActiveTab(idx)}
          />
        </aside>
      )}

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Custom Header */}
        <header
          style={{
            marginLeft: isMobile ? 8 : 12,
            marginTop: isMobile ? 12 : 24,
            marginRight: isMobile ? 8 : 24,
            marginBottom: 12,
            paddingLeft: isMobile ? 12 : isSmallPc ? 16 : 24,
            paddingRight: isMobile ? 12 : isSmallPc ? 16 : 24,
            paddingTop: isMobile ? 10 : 16,
            paddingBottom: isMobile ? 10 : 16,
          }}
          className="flex shrink-0 items-center justify-between rounded-[20px] border border-[#E2EFEA] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.02)]"
        >
          <div className="flex min-w-0 flex-1 items-center">
            {isMobile && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="mr-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-slate-800 hover:bg-slate-100"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <div className="min-w-0">
              <h2
                style={{ fontSize: isMobile ? 16 : 20 }}
                className="truncate font-extrabold text-[#1E293B]"
              >
                {getTabTitle(activeTab)}
              </h2>
              {!isMobile && (
                <p className="mt-0.5 text-[11px] font-medium text-[#64748B]">
                  Hoş geldiniz, sistem durumunu buradan yönetebilirsiniz.
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center">
            {service.isFirestoreError &&
              (!isMobile ? (
                <div className="mr-3 flex items-center gap-1.5 rounded-[10px] border border-amber-300 bg-amber-100 px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                  <span className="text-[11px] font-semibold text-amber-800">
                    Yerel Mod (Firestore Bağlanamadı)
                  </span>
                </div>
              ) : (
                <div
                  title="Yerel Mod (Firestore Bağlanamadı)"
                  className="mr-2 text-amber-700"
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
              ))}

            {isMobile ? (
              <button
                type="button"
                title="Yenile"
                onClick={() => service.syncWithFirestore()}
                className="flex cursor-pointer items-center justify-center rounded-[10px] bg-[#ECFDF5] p-3 text-[#0F9F6E] hover:bg-emerald-100"
              >
                <RefreshCw className="h-[18px] w-[18px]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => service.syncWithFirestore()}
                className="flex cursor-pointer items-center gap-2 rounded-[10px] bg-[#ECFDF5] px-4 py-3 text-sm font-semibold text-[#0F9F6E] transition-colors hover:bg-emerald-100"
              >
                <RefreshCw className="h-[18px] w-[18px]" />
                <span>Yenile</span>
              </button>
            )}

            <button
              type="button"
              title="Çıkış Yap"
              onClick={() => service.logout()}
              className="ml-2 flex cursor-pointer items-center justify-center rounded-[10px] bg-red-50 p-3 text-red-400 transition-colors hover:bg-red-100"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {activeTab === 0 && (
            <AnimalsTab isMobile={isMobile} isSmallPc={isSmallPc} />
          )}
          {activeTab === 1 && (
            <RegistrationsTab isMobile={isMobile} isSmallPc={isSmallPc} />
          )}
          {activeTab === 2 && (
            <SiteConfigTab isMobile={isMobile} isSmallPc={isSmallPc} />
          )}
          {activeTab === 3 && (
            <FaqEditorTab isMobile={isMobile} isSmallPc={isSmallPc} />
          )}
          {activeTab === 4 && (
            <MainPageTextsTab isMobile={isMobile} isSmallPc={isSmallPc} />
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarContents({
  activeTab,
  isSmallPc,
  onSelect,
}: {
  activeTab: number;
  isSmallPc: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="h-8" />
      {/* Logo Area */}
      <div className="flex items-center px-6">
        <div className="flex items-center justify-center rounded-xl bg-[#0F9F6E]/20 p-2">
          <PawPrint className="h-6 w-6 text-[#0F9F6E]" />
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <div
            style={{ fontSize: isSmallPc ? 14 : 16 }}
            className="font-extrabold tracking-[0.5px] text-white"
          >
            Olimpik Kurban
          </div>
          <div className="text-[11px] font-semibold text-[#86A59D]">
            Yönetim Paneli
          </div>
        </div>
      </div>

      <div className="h-10" />

      {NAV_ITEMS.map(({ index, title, icon: Icon }) => {
        const active = activeTab === index;
        return (
          <div
            key={index}
            style={{
              paddingLeft: isSmallPc ? 12 : 16,
              paddingRight: isSmallPc ? 12 : 16,
            }}
            className="py-1"
          >
            <button
              type="button"
              onClick={() => onSelect(index)}
              style={{
                paddingLeft: isSmallPc ? 12 : 16,
                paddingRight: isSmallPc ? 12 : 16,
                paddingTop: isSmallPc ? 10 : 14,
                paddingBottom: isSmallPc ? 10 : 14,
              }}
              className={`flex w-full cursor-pointer items-center rounded-xl text-left transition-all duration-200 ${
                active
                  ? "bg-[#0F9F6E] text-white shadow-[0_4px_12px_rgba(15,159,110,0.3)]"
                  : "text-[#86A59D] hover:bg-white/5"
              }`}
            >
              <Icon
                style={{ width: isSmallPc ? 18 : 20, height: isSmallPc ? 18 : 20 }}
                className="shrink-0"
              />
              <span
                style={{
                  marginLeft: isSmallPc ? 10 : 14,
                  fontSize: isSmallPc ? 12 : 13,
                }}
                className={`truncate ${active ? "font-bold" : "font-semibold"}`}
              >
                {title}
              </span>
            </button>
          </div>
        );
      })}

      <div className="flex-1" />

      <div className="p-6 text-center text-[11px] font-semibold text-[#86A59D]">
        v1.1.0 — 2026
      </div>
    </div>
  );
}

