"use client";

import { usePathname } from "next/navigation";
import SmoothScroll from "@/components/smooth-scroll";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const disableSmoothScroll = pathname.includes("/automations/");

  return (
    <>
      {children}
      {!disableSmoothScroll && <SmoothScroll />}
    </>
  );
}
