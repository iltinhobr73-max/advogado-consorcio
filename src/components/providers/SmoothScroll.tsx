"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type ScrollTarget = string | number | HTMLElement;
type ScrollToFn = (target: ScrollTarget, options?: { offset?: number }) => void;

const ScrollToContext = createContext<ScrollToFn>(() => {});

/** Rola até um alvo pelo Lenis (ou scroll nativo instantâneo com reduced motion). */
export const useScrollTo = () => useContext(ScrollToContext);

/**
 * Instância única de Lenis do site, rodando no ticker do GSAP e
 * sincronizada com o ScrollTrigger. Com prefers-reduced-motion, fica
 * desligada e o scroll é o nativo.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback<ScrollToFn>((target, options) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset: options?.offset ?? 0, duration: 1.4 });
      return;
    }
    // Fallback sem Lenis (reduced motion): salto direto, sem suavização.
    const el =
      typeof target === "string"
        ? document.querySelector<HTMLElement>(target)
        : typeof target === "number"
          ? null
          : target;
    const top =
      typeof target === "number"
        ? target
        : el
          ? el.getBoundingClientRect().top + window.scrollY
          : 0;
    window.scrollTo({ top: top + (options?.offset ?? 0), behavior: "instant" });
  }, []);

  return (
    <ScrollToContext.Provider value={scrollTo}>{children}</ScrollToContext.Provider>
  );
}
