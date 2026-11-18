"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useScrollLock, useScrollTo } from "@/components/providers/SmoothScroll";
import { ESCRITORIO, SUMARIO, WHATSAPP_URL } from "@/content/escritorio";
import { Logo } from "@/components/doc/Logo";

/**
 * Navegação flutuante: "Sumário" (índice do documento, com as folhas) e a
 * aba de WhatsApp. Aparecem depois do hero; no celular, somem durante a
 * Leitura guiada para não cobrir as notas.
 */

export function Indice() {
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const scrollTo = useScrollTo();
  const { lock, unlock } = useScrollLock();
  const [aberto, setAberto] = useState(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.set(q("[data-painel]"), { yPercent: 100, autoAlpha: 0 });
      gsap.set(q("[data-linha]"), { autoAlpha: 0, y: 20 });

      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          mobile: "(max-width: 1023px)",
        },
        (ctx) => {
          const { reduce, mobile } = ctx.conditions as { reduce: boolean; mobile: boolean };
          const flutuantes = q("[data-flutuante]");
          const hero = document.getElementById("top");
          const leitura = document.getElementById("leitura")?.parentElement; // pin-spacer
          let depoisDoHero = false;
          let naLeitura = false;

          const atualizar = () => {
            const show = depoisDoHero && !(mobile && naLeitura);
            gsap.to(flutuantes, {
              autoAlpha: show ? 1 : 0,
              y: show ? 0 : 16,
              duration: reduce ? 0 : 0.8,
              ease: show ? "power3.out" : "power3.in",
              stagger: reduce ? 0 : 0.2,
              overwrite: true,
            });
          };
          gsap.set(flutuantes, { autoAlpha: 0, y: 16 });

          if (hero) {
            ScrollTrigger.create({
              trigger: hero,
              start: "bottom 55%",
              onEnter: () => ((depoisDoHero = true), atualizar()),
              onLeaveBack: () => ((depoisDoHero = false), atualizar()),
            });
          }
          if (leitura && mobile) {
            ScrollTrigger.create({
              trigger: leitura,
              start: "top 80%",
              end: "bottom 20%",
              onToggle: (self) => ((naLeitura = self.isActive), atualizar()),
            });
          }
        },
      );
    },
    { scope: root },
  );

  // Handlers de evento comuns (não rodam no render).
  const abrir = () => {
    const q = gsap.utils.selector(root);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lock();
    setAberto(true);
    gsap
      .timeline()
      .to(q("[data-painel]"), { yPercent: 0, autoAlpha: 1, duration: reduce ? 0 : 0.9, ease: "expo.out" })
      .to(
        q("[data-linha]"),
        { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.8, ease: "power3.out", stagger: reduce ? 0 : 0.2 },
        reduce ? 0 : 0.25,
      );
    requestAnimationFrame(() => root.current?.querySelector<HTMLElement>("[data-linha] a")?.focus());
  };

  const fechar = (depois?: () => void) => {
    const q = gsap.utils.selector(root);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(q("[data-linha]"), { autoAlpha: 0, y: 20 });
          setAberto(false);
          unlock();
          opener.current?.focus({ preventScroll: true });
          depois?.();
        },
      })
      .to(q("[data-painel]"), { yPercent: 100, duration: reduce ? 0 : 0.7, ease: "power3.in" })
      .set(q("[data-painel]"), { autoAlpha: 0 });
  };

  // Esc fecha o sumário. O handler vive num ref para o efeito não depender do render.
  const fecharRef = useRef(fechar);
  useEffect(() => {
    fecharRef.current = fechar;
  });
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && fecharRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  return (
    <div ref={root}>
      {/* ---------- Botões flutuantes ---------- */}
      <button
        ref={opener}
        type="button"
        data-flutuante
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={abrir}
        className="invisible fixed bottom-4 left-4 z-40 flex items-center gap-3 border border-ink bg-paper px-4 py-3 font-mono text-xs text-ink shadow-[0_10px_30px_-12px_rgba(18,18,17,0.35)] hover:bg-ink hover:text-paper sm:bottom-6 sm:left-6"
      >
        <span aria-hidden className="flex flex-col gap-[3px]">
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-2.5 bg-current" />
        </span>
        Sumário
      </button>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-flutuante
        aria-label={`Conversar no WhatsApp: ${ESCRITORIO.whatsapp.exibicao}`}
        className="group invisible fixed bottom-4 right-4 z-40 flex items-stretch bg-ink text-paper ring-1 ring-paper/20 shadow-[0_10px_30px_-12px_rgba(18,18,17,0.5)] sm:bottom-6 sm:right-6"
      >
        <span className="flex items-center px-4 py-3 font-mono text-xs">WhatsApp</span>
        <span className="grid w-11 place-items-center border-l border-paper/15 transition-colors group-hover:bg-marker group-hover:text-ink">
          ↗
        </span>
      </a>

      {/* ---------- Painel do sumário ---------- */}
      <div
        data-painel
        role="dialog"
        aria-modal="true"
        aria-label="Sumário"
        aria-hidden={!aberto}
        className="invisible fixed inset-0 z-50 overflow-y-auto bg-paper text-ink"
      >
        <div className="mx-auto flex min-h-full max-w-[1680px] flex-col px-4 pb-10 pt-5 sm:px-8 lg:px-12">
          <div className="font-mono text-[11px] leading-none text-ink-soft sm:text-xs">
            <div className="flex items-baseline justify-between gap-4">
              <span>Sumário</span>
              <Logo className="hidden h-12 sm:block" />
              <button
                type="button"
                onClick={() => fechar()}
                className="-m-2 p-2 text-ink underline-offset-4 hover:underline"
              >
                fechar ×
              </button>
            </div>
            <div className="mt-3 h-px w-full bg-ink" />
          </div>

          <nav aria-label="Folhas do documento" className="my-auto py-12">
            <ol>
              {SUMARIO.map((s) => (
                <li key={s.fl} data-linha>
                  <a
                    href={s.href}
                    tabIndex={aberto ? 0 : -1}
                    onClick={(e) => {
                      e.preventDefault();
                      fechar(() => (s.href === "#top" ? scrollTo(0) : scrollTo(s.href)));
                    }}
                    className="group flex items-baseline gap-3 py-2 sm:gap-5 sm:py-3"
                  >
                    <span className="font-display text-[clamp(2rem,8.5vw,5.5rem)] leading-[0.95] group-hover:bg-[linear-gradient(transparent_55%,var(--color-marker)_55%)]">
                      {s.titulo}
                    </span>
                    <span
                      aria-hidden
                      className="mb-[0.4em] flex-1 border-b border-dotted border-ink/40"
                    />
                    <span className="font-mono text-xs tabular-nums text-ink-soft sm:text-sm">fl. {s.fl}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div data-linha className="flex flex-col gap-2 border-t border-ink/15 pt-5 font-mono text-[11px] text-ink-soft sm:flex-row sm:justify-between">
            <span>{ESCRITORIO.oabs.join(" · ")}</span>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-ink hover:underline">
              WhatsApp {ESCRITORIO.whatsapp.exibicao} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
