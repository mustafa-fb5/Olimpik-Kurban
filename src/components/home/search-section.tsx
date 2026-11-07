"use client";

import { useState } from "react";
import { Hash, Info, Loader2, PawPrint, Scale, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSiteData, type Animal, type Shareholder } from "@/lib/site-data";
import { useReveal } from "@/hooks/use-reveal";

function maskPhone(phone: string): string {
  const clean = phone.replace(/\s+/g, "");
  if (clean.length < 7) return phone;
  if (clean.startsWith("0") && clean.length >= 10) {
    const part1 = clean.slice(0, 4);
    const part2 = clean.slice(-4);
    return `${part1} *** ** ${part2.slice(0, 2)} ${part2.slice(2)}`;
  }
  return `${clean.slice(0, 3)} *** ** ${clean.slice(-2)}`;
}

export function SearchSection() {
  const { mainPageTexts: texts, animals } = useSiteData();
  const { ref, visible } = useReveal<HTMLElement>(0.2);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Animal[]>([]);
  const [matchingSlots, setMatchingSlots] = useState<Record<string, Set<number>>>({});

  const doSearch = () => {
    const q = query.trim();
    if (!q) return;

    setSearching(true);
    setResultMessage(null);
    setSearchResults([]);
    setMatchingSlots({});

    const cleanPhoneQuery = q.replace(/\D/g, "").replace(/^0+/, "");
    const qLower = q.toLowerCase();
    const results: Animal[] = [];
    const matchedMap: Record<string, Set<number>> = {};

    for (const animal of animals) {
      const earTag = (animal.earTag ?? "").toString().toLowerCase();
      const animalName = (animal.name ?? "").toString().toLowerCase();

      let isMatch = false;
      const matchedIndices = new Set<number>();

      if (earTag.includes(qLower) || animalName.includes(qLower)) {
        isMatch = true;
      }

      const shareholders = animal.shareholders ?? [];
      shareholders.forEach((sh, i) => {
        const name = (sh.name ?? "").toString().toLowerCase();
        const phone = (sh.phone ?? "")
          .toString()
          .replace(/\D/g, "")
          .replace(/^0+/, "");

        if (name && name.includes(qLower)) {
          isMatch = true;
          matchedIndices.add(i);
        }
        if (cleanPhoneQuery && phone && phone.includes(cleanPhoneQuery)) {
          isMatch = true;
          matchedIndices.add(i);
        }
      });

      if (isMatch) {
        results.push(animal);
        if (matchedIndices.size > 0) {
          matchedMap[animal.id ?? ""] = matchedIndices;
        }
      }
    }

    setTimeout(() => {
      setSearching(false);
      setSearchResults(results);
      setMatchingSlots(matchedMap);
      if (results.length === 0) {
        setResultMessage(
          texts.search_error ??
            "Sorgunuz için henüz bir sonuç bulunamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.",
        );
      }
    }, 600);
  };

  return (
    <section
      ref={ref}
      className={`bg-gradient-to-b from-white to-slate-50 px-5 py-14 md:px-12 md:py-20 min-[1201px]:px-[120px] min-[1201px]:py-24 ${
        visible ? "is-visible" : ""
      }`}
    >
      <div className="reveal-fade mx-auto max-w-[720px] overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_16px_40px_rgba(5,150,105,0.08),0_2px_8px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="flex flex-col items-center bg-gradient-to-r from-emerald-600 to-emerald-700 p-7 text-center md:p-10">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white/15">
            <Search className="h-[26px] w-[26px] text-white" />
          </div>
          <h2 className="mt-4 text-[22px] font-black tracking-[1px] text-white md:text-[28px]">
            {texts.search_title ?? "KURBANINI GÖR"}
          </h2>
          <p className="mt-2 text-[15px] text-white/85">
            {texts.search_subtitle ??
              "Küpe numarası, isim veya telefon ile kurbanınızı sorgulayabilirsiniz."}
          </p>
        </div>

        {/* Search form */}
        <div className="p-6 md:p-9">
          <div className="flex items-center gap-3">
            <div className="relative flex flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50">
              <Hash className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doSearch();
                }}
                placeholder={
                  texts.search_placeholder ?? "Örn: TR-123456... veya Ad Soyad"
                }
                className="h-auto border-0 bg-transparent px-4 py-[18px] text-[15px] text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
              />
            </div>

            <button
              type="button"
              onClick={doSearch}
              disabled={searching}
              className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-7 py-[18px] text-[15px] font-bold text-white transition-all duration-200 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_4px_16px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed"
            >
              {searching ? (
                <Loader2 className="h-[22px] w-[22px] animate-spin text-white" />
              ) : (
                <span>{texts.search_btn ?? "Sorgula"}</span>
              )}
            </button>
          </div>

          {/* Result message */}
          {resultMessage && (
            <div className="mt-5 flex items-center gap-3 rounded-[14px] border border-amber-500/20 bg-amber-500/8 p-4">
              <Info className="h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-sm leading-[1.5] text-slate-700">
                {resultMessage}
              </p>
            </div>
          )}

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="mt-6 space-y-4">
              {searchResults.map((animal) => (
                <SearchResultCard
                  key={animal.id}
                  animal={animal}
                  matchedIndices={matchingSlots[animal.id ?? ""] ?? new Set()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SearchResultCard({
  animal,
  matchedIndices,
}: {
  animal: Animal;
  matchedIndices: Set<number>;
}) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = animal.photoUrl ?? "";
  const shareholders: Shareholder[] = animal.shareholders ?? [];

  const statsWidget = (
    <div className="flex flex-col">
      {photoUrl && !imgError ? (
        <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={animal.name || "Kurbanlık"}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
          <PawPrint className="h-10 w-10 text-slate-400" />
          <span className="mt-2 text-xs font-bold text-slate-400">
            Kurbanlık Resmi
          </span>
        </div>
      )}

      <h3 className="mt-4 text-lg font-extrabold text-slate-800">
        {animal.name || "Kurbanlık"}
      </h3>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
          {animal.group ?? ""}
        </span>
        {animal.earTag && (
          <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
            Küpe: {animal.earTag}
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        {animal.kesimNo && (
          <div className="flex flex-1 flex-col items-center rounded-xl border border-blue-200 bg-blue-50 p-2.5">
            <Hash className="h-4 w-4 text-blue-700" />
            <span className="mt-1 text-[10px] text-slate-500">Sıra No</span>
            <span className="mt-0.5 text-[13px] font-extrabold text-blue-700">
              {animal.kesimNo}
            </span>
          </div>
        )}
        {animal.kilogram && (
          <div className="flex flex-1 flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <Scale className="h-4 w-4 text-slate-600" />
            <span className="mt-1 text-[10px] text-slate-500">Canlı Ağırlık</span>
            <span className="mt-0.5 text-[13px] font-extrabold text-slate-600">
              {animal.kilogram} kg
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const slotsWidget = (
    <div className="flex flex-col">
      <h4 className="mb-3 text-[15px] font-extrabold text-slate-800">
        Kurban Hissedarları
      </h4>
      <div className="space-y-1.5">
        {Array.from({ length: 7 }, (_, i) => {
          const sh = shareholders[i] ?? {
            slot: i + 1,
            name: "",
            phone: "",
            isTekDuzen: false,
            hasVekalet: false,
          };
          const name = sh.name ?? "";
          const phone = sh.phone ?? "";
          const isEmpty = !name;
          const isMatched = matchedIndices.has(i);
          const isTekDuzen = sh.isTekDuzen === true;
          const hasVekalet = sh.hasVekalet === true;
          const highlight = isMatched || isTekDuzen;

          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${
                highlight
                  ? "border-[1.5px] border-emerald-500 bg-emerald-50 shadow-[0_2px_8px_rgba(16,185,129,0.1)]"
                  : isEmpty
                    ? "border border-slate-200 bg-slate-50"
                    : "border border-[#E2EFE9] bg-white"
              }`}
            >
              <div
                className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                  highlight
                    ? "bg-emerald-500"
                    : isEmpty
                      ? "bg-slate-300"
                      : "bg-emerald-700"
                }`}
              >
                {i + 1}
              </div>

              <div className="min-w-0 flex-1">
                {isEmpty ? (
                  <span className="text-xs italic text-slate-400">Boş Hisse</span>
                ) : (
                  <div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`truncate text-xs font-bold ${
                          highlight ? "text-emerald-800" : "text-slate-700"
                        }`}
                      >
                        {name}
                      </span>
                      {hasVekalet && (
                        <span className="rounded border border-blue-200 bg-blue-50 px-[5px] py-px text-[9px] font-black text-blue-700">
                          V
                        </span>
                      )}
                    </div>
                    {phone && (
                      <div className="text-[10px] text-slate-500">
                        {maskPhone(phone)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isMatched && (
                <span className="rounded-md bg-emerald-500 px-2 py-1 text-[9px] font-extrabold text-white">
                  Sizin Hisseniz
                </span>
              )}
              {isTekDuzen && (
                <span className="rounded-md bg-emerald-700 px-2 py-1 text-[9px] font-extrabold text-white">
                  Tek Düzen
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="rounded-[20px] border border-[#E2EFE9] bg-white p-5 md:rounded-3xl md:p-6 md:shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="md:w-[240px] md:shrink-0">{statsWidget}</div>
        <div className="my-5 h-px bg-[#E2EFEA] md:mx-6 md:my-0 md:h-auto md:w-px" />
        <div className="flex-1">{slotsWidget}</div>
      </div>
    </div>
  );
}

