"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

const WA_URL =
  "https://wa.me/905534251465?text=Merhaba%2C%20kurban%20ile%20alakal%C4%B1%20bilgi%20almak%20istiyorum.";

export function WhatsappFab() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp İletişim Hattı"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed right-6 bottom-6 z-50 flex flex-col items-end cursor-pointer drop-shadow-xl"
    >
      {/* Tooltip */}
      <div
        className={`pointer-events-none mb-2 rounded-xl border border-slate-100 bg-white px-3.5 py-2 text-[13px] font-bold text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-200 ${
          hovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
        }`}
      >
        {"Bize WhatsApp'tan Yazın"}
      </div>

      {/* FAB button */}
      <div
        style={{ backgroundColor: "#25D366" }}
        className={`flex items-center justify-center text-white shadow-[0_6px_20px_rgba(37,211,102,0.45)] transition-all duration-200 hover:scale-105 active:scale-95 ${
          hovered
            ? "h-[62px] w-[62px] rounded-full"
            : "h-[58px] w-[58px] rounded-full"
        }`}
      >
        <MessageCircle className="h-8 w-8 fill-white text-[#25D366]" />
      </div>
    </a>
  );
}


