import type { Metadata } from "next";
import { LiveTrackingScreen } from "@/components/live-tracking/live-tracking-screen";

export const metadata: Metadata = {
  title: "Canlı Kesim Takibi - Olimpik Kurban",
};

export default function CanliTakipPage() {
  return <LiveTrackingScreen />;
}

