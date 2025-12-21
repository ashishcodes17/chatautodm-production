"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import SmoothScroll from "@/components/smooth-scroll";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const disableSmoothScroll = pathname.includes("/automations/");

  // Use useLayoutEffect to set attribute BEFORE paint (synchronous)
  useLayoutEffect(() => {
    if (disableSmoothScroll) {
      document.documentElement.setAttribute('data-disable-smooth-scroll', 'true');
    } else {
      document.documentElement.removeAttribute('data-disable-smooth-scroll');
    }
  }, [disableSmoothScroll]);

  // Fallback useEffect for older browsers
  useEffect(() => {
    if (disableSmoothScroll) {
      document.documentElement.setAttribute('data-disable-smooth-scroll', 'true');
    } else {
      document.documentElement.removeAttribute('data-disable-smooth-scroll');
    }
  }, [disableSmoothScroll]);

  return (
    <>
      {children}
      {!disableSmoothScroll && <SmoothScroll />}
    </>
  );
}
