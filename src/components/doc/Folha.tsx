"use client";

import { gsap } from "@/lib/gsap";

/** Cabeçalho de documento repetido em cada folha (mono + régua fina). */
export function FolhaHeader({ left, center, fl }: { left: string; center?: string; fl: string }) {
  return (
    <div className="font-mono text-[11px] leading-none text-ink-soft sm:text-xs">
      <div className="flex items-baseline justify-between gap-4">
        <span>{left}</span>
        {center && <span className="hidden sm:inline">{center}</span>}
        <span>fl. {fl}</span>
      </div>
      <div data-folha-rule className="mt-3 h-px w-full bg-ink" />
    </div>
  );
}

export const STAGGER = 0.2;
export const EASE_IN = "power3.out";

/**
 * Entrada padrão de uma folha, disparada pelo scroll:
 *  - [data-folha-rule]  régua do cabeçalho traçada (expo.inOut)
 *  - [data-item]        elementos em sequência, 0.2s entre cada (power3.out)
 *  - [data-draw]        linhas traçadas da esquerda para a direita (expo.out)
 * Chame dentro do ramo "motion" de um gsap.matchMedia().
 */
export function revealFolha(
  q: (sel: string) => Element[],
  trigger: Element,
  start = "top 72%",
) {
  const rule = q("[data-folha-rule]");
  const items = q("[data-item]");
  const draws = q("[data-draw]");
  gsap.set(rule, { scaleX: 0, transformOrigin: "0% 50%" });
  gsap.set(items, { autoAlpha: 0, y: 26 });
  gsap.set(draws, { scaleX: 0, transformOrigin: "0% 50%" });

  return gsap
    .timeline({ scrollTrigger: { trigger, start, toggleActions: "play none none reverse" } })
    .to(rule, { scaleX: 1, duration: 1.2, ease: "expo.inOut" }, 0)
    .to(items, { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE_IN, stagger: STAGGER }, 0.3)
    .to(draws, { scaleX: 1, duration: 0.9, ease: "expo.out", stagger: STAGGER }, 0.8);
}
