"use client";

import { Landmark, MapPin, Phone } from "lucide-react";
import { useSiteData } from "@/lib/site-data";

export function FooterSection() {
  const { contactPhone, contactAddress } = useSiteData();

  return (
    <footer className="bg-gradient-to-b from-slate-800 to-slate-900">
      {/* CTA Banner */}
      <div className="px-6 py-12 md:px-16 md:py-[72px]">
        <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
          {/* Decorative icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
            <Landmark className="h-[30px] w-[30px] text-emerald-400" />
          </div>

          <h2 className="mt-7 whitespace-pre-line text-[28px] leading-[1.2] font-extrabold tracking-[-0.5px] text-white md:text-[38px]">
            {"İbadetinizi Birlikte\nİfa Edelim"}
          </h2>

          <p className="mt-4 max-w-[600px] text-[15px] leading-[1.7] text-slate-300 md:text-[17px]">
            {
              'Talebelerimiz ve muhtaçlar için "Bağış Hisse" seçeneğimiz bulunmaktadır. Hizmetimiz 20 yıldır kaliteden ödün vermeden sürmektedir.'
            }
          </p>

          {/* Contact info */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-[20px] border border-white/10 bg-white/5 px-7 py-[18px]">
            <div className="flex items-center gap-2 text-emerald-400">
              <Phone className="h-5 w-5" />
              <span className="text-base font-bold">{contactPhone}</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-emerald-400">
              <MapPin className="h-5 w-5" />
              <span className="text-base font-bold">{contactAddress}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8 px-6 py-6 md:px-16">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 overflow-hidden rounded-[10px] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Olimpik Kurban"
                className="h-full w-full rounded-[10px] object-cover"
              />
            </div>
            <span className="text-base font-bold text-white">Olimpik Kurban</span>
          </div>
          <p className="text-[13px] text-slate-400">
            © 2026 Olimpik Kurban. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}

