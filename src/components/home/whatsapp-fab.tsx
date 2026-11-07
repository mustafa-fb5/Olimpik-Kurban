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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed right-7 bottom-7 z-40 flex flex-col items-end"
    >
      {/* Tooltip */}
      <div
        className={`pointer-events-none mb-2.5 rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-200 ${
          hovered ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"
        }`}
      >
        {"Bize WhatsApp'tan Yazın"}
      </div>

      {/* FAB button */}
      <div
        className={`flex items-center justify-center bg-whatsapp text-white transition-all duration-200 animate-wa-pulse ${
          hovered
            ? "h-[62px] w-[62px] rounded-[20px]"
            : "h-[58px] w-[58px] rounded-[18px]"
        }`}
      >
        <MessageCircle className="h-7 w-7 fill-current" />
      </div>
    </a>
  );
}

