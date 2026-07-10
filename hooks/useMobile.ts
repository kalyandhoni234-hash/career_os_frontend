"use client";

import { useState, useEffect } from "react";

const MOBILE_BP = 768;
const TABLET_BP = 1024;

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < MOBILE_BP);
      setIsTablet(window.innerWidth >= MOBILE_BP && window.innerWidth < TABLET_BP);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return { isMobile, isTablet };
}
