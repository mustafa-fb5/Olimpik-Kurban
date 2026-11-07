"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Menu, ShieldCheck, X } from "lucide-react";
import { useSiteData } from "@/lib/site-data";

export type SectionId =
  | "hero"
  | "features"
  | "sorgula"
  | "fiyatlar"
  | "kayit"
  | "sss"
  | "footer";

interface NavbarProps {
  onScrollTo: (section: SectionId) => void;
}

export function Navbar({ onScrollTo }: NavbarProps) {
  const service = useSiteData();
  const isLiveActive = service.isLiveTrackingActive;
  const isLoggedIn = service.isAdminLoggedIn;

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: SectionId) => {
    onScrollTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 backdrop-blur-md transition-all duration-300 ${
        isScrolled
          ? "border-b border-slate-200 bg-white/92 shadow-[0_0_20px_rgba(0,0,0,0.05)]"
          : "border-b border-transparent bg-white/60"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center px-6">
        {/* Logo */}
        <button
          type="button"
          onClick={() => scrollTo("hero")}
          className="flex cursor-pointer items-center gap-3"
        >
          <div className="h-12 w-12 overflow-hidden rounded-[14px] border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Olimpik Kurban"
              className="h-full w-full rounded-[13px] object-cover"
            />
          </div>
          <span className="text-xl font-black text-slate-900">Olimpik Kurban</span>
        </button>

        <div className="flex-1" />

        {/* Desktop menu (>900px) */}
        <nav className="hidden items-center min-[901px]:flex">
          {isLiveActive && (
            <Link
              href="/canli-takip"
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:text-emerald-600"
            >
              <PulseDot />
              <span>Canlı Takip</span>
            </Link>
          )}
          <NavItem label="Hisse Kaydı" onClick={() => scrollTo("kayit")} />
          <NavItem label="Kurbanını Gör" onClick={() => scrollTo("sorgula")} />
          <NavItem label="Seçenekler" onClick={() => scrollTo("fiyatlar")} />
          <NavItem label="SSS" onClick={() => scrollTo("sss")} />
          <NavItem label="İletişim" onClick={() => scrollTo("footer")} />

          <div className="w-2" />

          <Link
            href="/admin"
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:bg-slate-100 ${
              isLoggedIn
                ? "border-[1.5px] border-emerald-500 text-emerald-700"
                : "border border-slate-200 text-slate-700"
            }`}
          >
            {isLoggedIn ? (
              <ShieldCheck className="h-[18px] w-[18px] text-emerald-600" />
            ) : (
              <Lock className="h-[18px] w-[18px] text-slate-600" />
            )}
            <span>Yönetici Paneli</span>
            {isLoggedIn && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
          </Link>

          <div className="w-2" />

          <CTAButton onClick={() => scrollTo("kayit")} />
        </nav>

        {/* Mobile hamburger (<=900px) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200/70 min-[901px]:hidden"
          aria-label="Menü"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`grid overflow-hidden transition-all duration-300 min-[901px]:hidden ${
          mobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 px-6 pb-5">
          <div className="border-t border-slate-200 pt-2">
            {isLiveActive && (
              <Link
                href="/canli-takip"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-100/70"
              >
                <PulseDot />
                <span>Canlı Takip</span>
              </Link>
            )}
            <MobileMenuItem label="Hisse Kaydı" onClick={() => scrollTo("kayit")} />
            <MobileMenuItem label="Kurbanını Gör" onClick={() => scrollTo("sorgula")} />
            <MobileMenuItem label="Seçenekler" onClick={() => scrollTo("fiyatlar")} />
            <MobileMenuItem label="SSS" onClick={() => scrollTo("sss")} />
            <MobileMenuItem label="İletişim" onClick={() => scrollTo("footer")} />
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center rounded-xl px-4 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-100/70"
            >
              Yönetici Paneli
            </Link>
            <div className="mt-3">
              <CTAButton fullWidth onClick={() => scrollTo("kayit")} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:text-emerald-600"
    >
      {label}
    </button>
  );
}

function MobileMenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center rounded-xl px-4 py-3.5 text-left text-base font-semibold text-slate-700 hover:bg-slate-100/70"
    >
      {label}
    </button>
  );
}

function CTAButton({ onClick, fullWidth }: { onClick: () => void; fullWidth?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-[14px] bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_4px_16px_rgba(16,185,129,0.4)] ${
        fullWidth ? "w-full" : ""
      }`}
    >
      Hemen Kayıt Ol
    </button>
  );
}

function PulseDot() {
  return (
    <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-red-pulse" />
  );
}

