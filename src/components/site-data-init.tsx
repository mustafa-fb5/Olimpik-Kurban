"use client";

import { useEffect } from "react";
import { siteData } from "@/lib/site-data";

/** Uygulama açılışında site verilerini (localStorage + Firestore) yükler. */
export function SiteDataInit() {
  useEffect(() => {
    siteData.init();
  }, []);
  return null;
}

