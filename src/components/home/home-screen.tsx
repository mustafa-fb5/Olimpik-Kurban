"use client";

import { useRef } from "react";
import { Navbar, type SectionId } from "./navbar";
import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { SearchSection } from "./search-section";
import { RegistrationForm } from "./registration-form";
import { ShareSection } from "./share-section";
import { FaqSection } from "./faq-section";
import { FooterSection } from "./footer-section";
import { WhatsappFab } from "./whatsapp-fab";

export function HomeScreen() {
  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    hero: null,
    features: null,
    sorgula: null,
    fiyatlar: null,
    kayit: null,
    sss: null,
    footer: null,
  });

  const scrollTo = (id: SectionId) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onScrollTo={scrollTo} />

      <main>
        <div
          ref={(el) => {
            sectionRefs.current.hero = el;
          }}
        >
          <HeroSection
            onKayitTap={() => scrollTo("kayit")}
            onSorgulaTap={() => scrollTo("sorgula")}
          />
        </div>

        <div
          ref={(el) => {
            sectionRefs.current.features = el;
          }}
        >
          <FeaturesSection />
        </div>

        <div
          ref={(el) => {
            sectionRefs.current.sorgula = el;
          }}
        >
          <SearchSection />
        </div>

        <div
          ref={(el) => {
            sectionRefs.current.kayit = el;
          }}
        >
          <ShareSection />
          <RegistrationForm donationOnly />
        </div>

        <div
          ref={(el) => {
            sectionRefs.current.sss = el;
          }}
        >
          <FaqSection />
        </div>

        <div
          ref={(el) => {
            sectionRefs.current.footer = el;
          }}
        >
          <FooterSection />
        </div>
      </main>

      <WhatsappFab />
    </div>
  );
}

