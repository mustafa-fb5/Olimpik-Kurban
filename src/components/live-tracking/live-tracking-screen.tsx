"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { siteData, useSiteData } from "@/lib/site-data";
import { useWindowSize } from "@/components/admin/use-window-size";

interface QueueItem {
  id: string;
  name: string;
  kesimNo?: string;
  earTag?: string;
  group?: string;
  isSlaughtered?: boolean;
  isMock?: boolean;
}

export function LiveTrackingScreen() {
  const router = useRouter();
  const service = useSiteData();
  const { width, height: screenHeight } = useWindowSize();

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setEntered(true);
      setCurrentTime(new Date());
    });
    const unsubRealtime = siteData.listenRealtime();
    const timer = setInterval(async () => {
      await siteData.syncWithFirestore();
      setCurrentTime(new Date());
    }, 3000);
    return () => {
      cancelAnimationFrame(id);
      clearInterval(timer);
      unsubRealtime();
    };
  }, []);

  const isMobile = width < 768;
  const isShortScreen = screenHeight < 720;
  const isVeryShortScreen = screenHeight < 600;

  const headerPaddingTop = isVeryShortScreen ? 8 : isShortScreen ? 12 : 16;
  const headerPaddingBottom = isVeryShortScreen ? 6 : isShortScreen ? 8 : 12;
  const headerSpacing = isVeryShortScreen ? 6 : isShortScreen ? 10 : 12;
  const closeBtnSize = isShortScreen ? 36 : 44;
  const closeBtnIconSize = isShortScreen ? 18 : 22;
  const cardMarginBottom = isVeryShortScreen ? 4 : isShortScreen ? 8 : 12;

  // Sort animals by kesimNo
  const sortedAnimals: QueueItem[] = [...service.animals].sort((a, b) => {
    const aNo = /^-?\d+$/.test((a.kesimNo ?? "").trim())
      ? parseInt(a.kesimNo, 10)
      : 999999;
    const bNo = /^-?\d+$/.test((b.kesimNo ?? "").trim())
      ? parseInt(b.kesimNo, 10)
      : 999999;
    return aNo - bNo;
  });

  const fullList: QueueItem[] = [
    ...sortedAnimals.filter((a) => (a.kesimNo ?? "").toString().trim().length > 0),
    ...sortedAnimals.filter((a) => (a.kesimNo ?? "").toString().trim().length === 0),
  ];

  let mockIndex = 1;
  while (fullList.length < 5) {
    fullList.push({
      id: `mock_${mockIndex}`,
      name: `${mockIndex} Numaralı Kurbanlık`,
      kesimNo: `${mockIndex}`,
      earTag: "Belirleniyor...",
      isSlaughtered: false,
      isMock: true,
    });
    mockIndex++;
  }

  const fullNextUpIndex = fullList.findIndex((item) => item.isSlaughtered !== true);

  let displayList: QueueItem[];
  if (fullList.length <= 5) {
    displayList = fullList;
  } else if (fullNextUpIndex === -1) {
    displayList = fullList.slice(fullList.length - 5);
  } else if (fullNextUpIndex < 1) {
    displayList = fullList.slice(0, 5);
  } else if (fullNextUpIndex >= fullList.length - 4) {
    displayList = fullList.slice(fullList.length - 5);
  } else {
    displayList = fullList.slice(fullNextUpIndex - 1, fullNextUpIndex + 4);
  }

  const nextUpIndex = displayList.findIndex((item) => item.isSlaughtered !== true);

  const hh = currentTime ? String(currentTime.getHours()).padStart(2, "0") : "--";
  const mm = currentTime ? String(currentTime.getMinutes()).padStart(2, "0") : "--";

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#F8FAFC]">
      <style>{`
        @keyframes lt-next-border {
          0%, 100% {
            border-color: #F59E0B;
            box-shadow: 0 0 8px 0 rgba(245, 158, 11, 0.08);
          }
          50% {
            border-color: #FCD34D;
            box-shadow: 0 0 14px 1.5px rgba(245, 158, 11, 0.16);
          }
        }
        @keyframes lt-next-dot {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 4px 0 rgba(217, 119, 6, 0.4);
          }
          50% {
            transform: scale(1.4);
            box-shadow: 0 0 8px 2px rgba(217, 119, 6, 0);
          }
        }
        @keyframes lt-live-dot {
          0%, 100% { box-shadow: 0 0 4px rgba(239, 68, 68, 0.2); }
          50% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.6); }
        }
      `}</style>

      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -top-[200px] -right-[200px] h-[500px] w-[500px] rounded-full bg-emerald-500/3" />
      <div className="pointer-events-none absolute -bottom-[200px] -left-[200px] h-[500px] w-[500px] rounded-full bg-red-500/[0.015]" />

      {/* Header */}
      <div
        style={{
          paddingTop: headerPaddingTop,
          paddingBottom: headerPaddingBottom,
        }}
        className="relative z-10 flex items-center px-6"
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{ width: closeBtnSize, height: closeBtnSize }}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-black/6 bg-black/4 text-slate-800 transition-colors hover:bg-black/8"
          aria-label="Kapat"
        >
          <X style={{ width: closeBtnIconSize, height: closeBtnIconSize }} />
        </button>

        <div className="ml-4 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1
              style={{
                fontSize: isMobile
                  ? isShortScreen
                    ? 16
                    : 18
                  : isShortScreen
                    ? 20
                    : 22,
              }}
              className="font-black tracking-[-0.5px] text-slate-900"
            >
              Canlı Kesim Takibi
            </h1>
            <span className="rounded-md bg-emerald-500/8 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              Son Güncelleme: {hh}:{mm}
            </span>
          </div>
          {!isVeryShortScreen && (
            <p className="mt-0.5 truncate text-xs text-slate-600">
              Kurban bayramı kesim sırasını ve durumunu buradan anlık izleyebilirsiniz.
            </p>
          )}
        </div>

        {/* Pulse Live Badge */}
        <div
          style={{
            paddingLeft: isShortScreen ? 8 : 12,
            paddingRight: isShortScreen ? 8 : 12,
            paddingTop: isShortScreen ? 4 : 6,
            paddingBottom: isShortScreen ? 4 : 6,
          }}
          className="ml-3 flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/8"
        >
          <span
            style={{
              width: isShortScreen ? 6 : 8,
              height: isShortScreen ? 6 : 8,
              animation: "lt-live-dot 2s ease-in-out infinite",
            }}
            className="rounded-full bg-red-500"
          />
          <span
            style={{ fontSize: isShortScreen ? 10 : 11 }}
            className="font-black tracking-[0.5px] text-red-700"
          >
            CANLI
          </span>
        </div>
      </div>

      <div style={{ height: headerSpacing }} />

      {/* Queue List */}
      <div className="relative z-10 flex flex-1 justify-center overflow-hidden">
        <div
          style={{ paddingBottom: isVeryShortScreen ? 8 : 16 }}
          className={`flex w-full max-w-[900px] flex-col px-6 ${
            displayList.length <= 5 && screenHeight > 400
              ? ""
              : "overflow-y-auto"
          }`}
        >
          {displayList.map((item, index) => {
            const isNextUp = index === nextUpIndex;
            const flexExpand = displayList.length <= 5 && screenHeight > 400;
            return (
              <div
                key={item.id}
                style={{
                  paddingBottom: cardMarginBottom,
                  transitionDelay: `${index * 60}ms`,
                }}
                className={`flex flex-col transition-all duration-700 ease-out ${
                  flexExpand ? "min-h-0 flex-1" : ""
                } ${entered ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
              >
                <LargeQueueCard
                  item={item}
                  isNextUp={isNextUp}
                  isShortScreen={isShortScreen}
                  isVeryShortScreen={isVeryShortScreen}
                  isMobile={isMobile}
                  fillHeight={flexExpand}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LargeQueueCard({
  item,
  isNextUp,
  isShortScreen,
  isVeryShortScreen,
  isMobile,
  fillHeight,
}: {
  item: QueueItem;
  isNextUp: boolean;
  isShortScreen: boolean;
  isVeryShortScreen: boolean;
  isMobile: boolean;
  fillHeight: boolean;
}) {
  const isSlaughtered = item.isSlaughtered === true;
  const isMock = item.isMock === true;
  const kesimNoStr = (item.kesimNo ?? "").toString().trim();

  const titleName = isMock
    ? item.name
    : kesimNoStr
      ? `${kesimNoStr}. Kurbanlık`
      : "Kurbanlık (Sırasız)";
  const subName = isMock ? "Kurbanlık Bilgisi Bekleniyor" : (item.group ?? "");

  const cardPaddingVertical = isVeryShortScreen ? 6 : isShortScreen ? 10 : 14;
  const cardPaddingHorizontal = isMobile ? 16 : 20;
  const counterSize = isVeryShortScreen ? 32 : isShortScreen ? 38 : 44;
  const counterFontSize = isVeryShortScreen ? 13 : isShortScreen ? 15 : 18;
  const titleFontSize = isVeryShortScreen ? 13 : isShortScreen ? 15 : 16;
  const subtitleFontSize = isVeryShortScreen ? 11 : isShortScreen ? 12 : 13;
  const badgeFontSize = isVeryShortScreen ? 9 : isShortScreen ? 9.5 : 10;
  const badgePaddingVertical = isVeryShortScreen ? 3 : isShortScreen ? 4 : 6;
  const badgePaddingHorizontal = isVeryShortScreen ? 8 : isShortScreen ? 10 : 12;
  const badgeIconSize = isVeryShortScreen ? 10 : isShortScreen ? 12 : 14;

  return (
    <div
      style={{
        paddingLeft: cardPaddingHorizontal,
        paddingRight: cardPaddingHorizontal,
        paddingTop: cardPaddingVertical,
        paddingBottom: cardPaddingVertical,
        animation:
          !isSlaughtered && isNextUp
            ? "lt-next-border 2s ease-in-out infinite"
            : undefined,
      }}
      className={`flex flex-col justify-center rounded-[20px] transition-all duration-300 ${
        fillHeight ? "h-full" : ""
      } ${
        isSlaughtered
          ? "border-[1.5px] border-emerald-500/50 bg-[#ECFDF5] shadow-[0_2px_8px_rgba(16,185,129,0.05)]"
          : isNextUp
            ? "border-2 border-amber-500 bg-[#FFFBEB]"
            : "border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]"
      }`}
    >
      <div className="flex items-center">
        {/* Large Numeric Counter */}
        <div
          style={{ width: counterSize, height: counterSize }}
          className={`flex shrink-0 items-center justify-center rounded-full border-[1.5px] ${
            isSlaughtered
              ? "border-emerald-400 bg-emerald-600 text-white"
              : isNextUp
                ? "border-amber-400 bg-amber-600 text-white"
                : "border-slate-200 bg-slate-100 text-slate-600"
          }`}
        >
          <span style={{ fontSize: counterFontSize }} className="font-black">
            {kesimNoStr || "-"}
          </span>
        </div>

        {/* Title & subtitle */}
        <div className="ml-4 min-w-0 flex-1">
          <div
            style={{ fontSize: titleFontSize }}
            className="truncate font-black text-slate-900"
          >
            {titleName}
          </div>
          <div
            style={{ fontSize: subtitleFontSize }}
            className={`mt-0.5 truncate font-semibold ${
              isSlaughtered
                ? "text-emerald-700"
                : isNextUp
                  ? "text-amber-700"
                  : "text-slate-500"
            }`}
          >
            {subName}
          </div>
        </div>

        {/* Status Badge */}
        <div
          style={{
            paddingLeft: badgePaddingHorizontal,
            paddingRight: badgePaddingHorizontal,
            paddingTop: badgePaddingVertical,
            paddingBottom: badgePaddingVertical,
          }}
          className={`ml-2 flex shrink-0 items-center gap-1.5 rounded-full border ${
            isSlaughtered
              ? "border-emerald-200 bg-emerald-100"
              : isNextUp
                ? "border-amber-200 bg-amber-100"
                : "border-slate-200 bg-slate-100"
          }`}
        >
          {isSlaughtered ? (
            <>
              <CheckCircle2
                style={{ width: badgeIconSize, height: badgeIconSize }}
                className="text-emerald-600"
              />
              <span
                style={{ fontSize: badgeFontSize }}
                className="font-black tracking-[0.5px] text-emerald-800"
              >
                KESİLDİ
              </span>
            </>
          ) : isNextUp ? (
            <>
              <span
                style={{
                  width: badgeIconSize / 2 + 1.5,
                  height: badgeIconSize / 2 + 1.5,
                  animation: "lt-next-dot 2s ease-in-out infinite",
                }}
                className="rounded-full bg-amber-600"
              />
              <span
                style={{ fontSize: badgeFontSize }}
                className="font-black tracking-[0.5px] text-amber-800"
              >
                SIRADAKİ
              </span>
            </>
          ) : (
            <>
              <span
                style={{ width: badgeIconSize / 2, height: badgeIconSize / 2 }}
                className="rounded-full bg-slate-400"
              />
              <span
                style={{ fontSize: badgeFontSize }}
                className="font-extrabold tracking-[0.5px] text-slate-600"
              >
                BEKLİYOR
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

