"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useScrollTo } from "@/components/providers/SmoothScroll";

/**
 * Conceito: "letras miúdas".
 * Ao fundo, um contrato de consórcio rolando em letra miúda. A frase
 * principal surge primeiro TARJADA, palavra por palavra — o leitor vê a
 * forma da frase antes de poder lê-la. As tarjas recuam e a da última
 * linha vira marca-texto: o que estava escondido passa a estar em destaque.
 */

type Word = { text: string; marker?: boolean };

const LINES: Word[][] = [
  [{ text: "Estava" }, { text: "no" }, { text: "contrato." }],
  [{ text: "Só" }, { text: "não" }, { text: "estava" }],
  [{ text: "em", marker: true }, { text: "destaque.", marker: true }],
];

const INK = "#121211";
const MARKER = "#f1e23b";
// O contrato é textura, não conteúdo.
const VIDEO_ALPHA = 0.13;

const HEADLINE = "Estava no contrato. Só não estava em destaque.";

// Ritmo levemente irregular das tarjas — como alguém riscando à mão.
const BAR_RHYTHM = [0, 0.11, 0.19, 0.42, 0.5, 0.6, 0.86, 0.97];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduce } = ctx.conditions as { reduce: boolean };
          const bars = q("[data-bar]");
          const redactBars = q("[data-bar]:not([data-marker])");
          const markerBars = q("[data-bar][data-marker]");
          const words = q("[data-word-text]");

          gsap.set(q("[data-gsap-pending]"), { autoAlpha: 1 });
          gsap.set(q("[data-hero-video]"), { autoAlpha: VIDEO_ALPHA });

          if (reduce) {
            video.current?.pause();
            gsap.set(redactBars, { autoAlpha: 0 });
            return;
          }

          /* ---------- Estado inicial ---------- */
          gsap.set(words, { autoAlpha: 0 });
          gsap.set(bars, {
            autoAlpha: 1,
            scaleX: 0,
            scaleY: 1,
            transformOrigin: "0% 50%",
            backgroundColor: INK,
          });
          gsap.set(q("[data-line-no]"), { autoAlpha: 0 });
          gsap.set(q("[data-hero-video]"), { autoAlpha: 0 });
          gsap.set(q("[data-hero-rule]"), { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.set(q("[data-hero-meta]"), { autoAlpha: 0, y: -8 });
          gsap.set(q("[data-hero-fade]"), { autoAlpha: 0, y: 14 });
          gsap.set(q("[data-footnote]"), { autoAlpha: 0 });
          gsap.set(q("[data-hero-continua]"), { autoAlpha: 0 });

          const tl = gsap.timeline({ delay: 0.2 });

          tl
            // 1. Só o contrato rolando. Nenhuma palavra ainda.
            .to(q("[data-hero-video]"), { autoAlpha: VIDEO_ALPHA, duration: 1.4, ease: "power1.out" }, 0)

            // 2. A frase é escrita... já censurada. Tarja por tarja.
            .to(
              bars,
              {
                scaleX: 1,
                duration: 0.24,
                ease: "power4.out",
                stagger: (i) => BAR_RHYTHM[i] ?? i * 0.1,
              },
              0.7,
            )
            .to(q("[data-line-no]"), { autoAlpha: 1, duration: 0.01, stagger: 0.42 }, 0.7)
            // texto entra por baixo das tarjas, invisível ao leitor
            .set(words, { autoAlpha: 1 }, 1.9)

            // 3. Pausa. A frase existe, mas não se lê.
            // 4. As tarjas recuam palavra a palavra.
            .addLabel("reveal", 2.75)
            .to(
              redactBars,
              {
                scaleX: 0,
                transformOrigin: "100% 50%",
                duration: 0.55,
                ease: "expo.inOut",
                stagger: 0.085,
              },
              "reveal",
            )
            // 5. A última tarja não some: vira marca-texto.
            .to(
              markerBars,
              { backgroundColor: MARKER, duration: 0.35, ease: "power2.out", stagger: 0.06 },
              "reveal+=0.75",
            )
            .to(
              markerBars,
              {
                scaleY: 0.44,
                transformOrigin: "50% 100%",
                duration: 0.8,
                ease: "expo.out",
                stagger: 0.06,
              },
              "reveal+=0.95",
            )
            .to(q("[data-footnote]"), { autoAlpha: 1, duration: 0.01 }, "reveal+=1.45")

            // 6. O documento se completa em volta.
            .to(q("[data-hero-rule]"), { scaleX: 1, duration: 1.1, ease: "expo.inOut" }, "reveal+=1.1")
            .to(q("[data-hero-meta]"), { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, "reveal+=1.5")
            .to(q("[data-hero-fade]"), { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }, "reveal+=1.6")
            .to(q("[data-hero-continua]"), { autoAlpha: 1, duration: 0.6 }, "reveal+=2.1");

          // Seta do "(continua)" cutucando para baixo.
          gsap.to(q("[data-continua-arrow]"), {
            y: 5,
            duration: 0.7,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });

          /* ---------- Scroll ---------- */
          const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };

          gsap.to(q("[data-hero-continua-inner]"), {
            autoAlpha: 0,
            y: 12,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "+=140", scrub: true },
          });
          // O contrato continua rolando mais rápido que a página.
          gsap.to(q("[data-hero-video-wrap]"), { yPercent: -22, ease: "none", scrollTrigger: st });
          // Linhas do título se separam levemente — o documento "abre".
          q("[data-hero-line]").forEach((line, i) => {
            gsap.to(line, { y: -40 * (i + 1), ease: "none", scrollTrigger: st });
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Apresentação"
      className="relative isolate flex h-svh min-h-[620px] w-full flex-col overflow-hidden bg-paper text-ink"
    >
      {/* ---------- Vídeo: o contrato em letra miúda ---------- */}
      <div
        data-hero-video-wrap
        aria-hidden
        className="absolute inset-x-0 -top-[6%] -z-10 h-[130%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_22%,black_62%,transparent_100%)]"
      >
        <video
          ref={video}
          data-hero-video
          data-gsap-pending
          className="h-full w-full object-cover opacity-[0.13] mix-blend-multiply grayscale"
          src="/media/contrato.mp4"
          poster="/media/contrato-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1680px] flex-1 flex-col px-4 pb-6 pt-5 sm:px-8 sm:pb-8 lg:px-12">
        {/* ---------- Cabeçalho de documento ---------- */}
        <div className="font-mono text-[11px] leading-none text-ink-soft sm:text-xs">
          <div className="flex items-baseline justify-between gap-4">
            <span data-hero-meta data-gsap-pending>
              Análise de contrato — consórcio
            </span>
            <span data-hero-meta data-gsap-pending className="hidden sm:inline">
              Lei nº 11.795/2008 · CDC
            </span>
            <span data-hero-meta data-gsap-pending>
              fl. 01
            </span>
          </div>
          <div data-hero-rule data-gsap-pending className="mt-3 h-px w-full bg-ink" />
        </div>

        {/* ---------- Título tarjado ---------- */}
        <h1 className="relative my-auto pt-10 sm:pt-6">
          <span className="sr-only">{HEADLINE}</span>
          <span aria-hidden className="block isolate">
            {LINES.map((line, li) => (
              <span
                key={li}
                data-hero-line
                className="relative grid grid-cols-[1fr] items-start sm:grid-cols-[3.25rem_1fr] lg:grid-cols-[4.5rem_1fr]"
              >
                <span
                  data-line-no
                  data-gsap-pending
                  className="hidden pt-[0.9em] font-mono text-[11px] tabular-nums text-ink-faint sm:block"
                >
                  {String(li + 1).padStart(2, "0")}
                </span>
                <span className="font-display block whitespace-nowrap text-[clamp(2.9rem,13.4vw,14.5rem)] leading-[0.84] tracking-[-0.012em] sm:text-[clamp(3rem,12vw,14.5rem)]">
                  {line.map((w, wi) => {
                    return (
                      <span key={wi}>
                        <span className="relative inline-block">
                          <span data-word-text data-gsap-pending className="relative">
                            {w.text}
                          </span>
                          {/* Tarja (vira marca-texto quando data-marker). mix-blend-multiply:
                              preta, esconde a tinta; amarela, deixa a tinta aparecer. */}
                          <span
                            data-bar
                            data-marker={w.marker ? "" : undefined}
                            className={
                              "pointer-events-none absolute -inset-x-[0.035em] top-[0.13em] bottom-[0.03em] mix-blend-multiply " +
                              (w.marker
                                ? "origin-bottom scale-y-[0.44] bg-marker"
                                : "invisible bg-ink")
                            }
                          />
                        </span>
                        {wi < line.length - 1 ? " " : null}
                      </span>
                    );
                  })}
                  {li === LINES.length - 1 && (
                    <sup
                      data-footnote
                      data-gsap-pending
                      className="ml-[0.06em] align-[0.95em] font-mono text-[0.13em] font-medium"
                    >
                      1
                    </sup>
                  )}
                </span>
              </span>
            ))}
          </span>
        </h1>

        {/* ---------- Rodapé: nota de margem + ação ---------- */}
        <div className="mt-8 grid gap-6 border-t border-ink/15 pt-5 sm:grid-cols-[3.25rem_1fr] lg:grid-cols-[4.5rem_1fr_auto] lg:items-end lg:gap-x-0">
          <span className="hidden sm:block" />
          <p
            data-hero-fade
            data-gsap-pending
            className="max-w-[46ch] font-mono text-[13px] leading-[1.6] text-ink-soft sm:text-sm"
          >
            <span className="text-ink">¹</span> Taxa de administração, fundo de reserva,
            multa por desistência, promessa de contemplação. A gente lê o seu
            contrato cláusula por cláusula e explica, por escrito, o que pode ser
            contestado.
          </p>

          <div data-hero-fade data-gsap-pending className="sm:col-start-2 lg:col-start-3">
            <a
              href="#contato"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#contato");
              }}
              className="group flex items-stretch bg-ink text-paper outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"
            >
              <span className="flex flex-1 flex-col justify-center px-5 py-3.5 sm:px-6">
                <span className="text-[15px] font-semibold tracking-[-0.005em] [font-stretch:88%] sm:text-base">
                  Enviar meu contrato para análise
                </span>
                <span className="mt-0.5 font-mono text-[11px] text-paper/55">
                  PDF ou foto das páginas
                </span>
              </span>
              <span className="grid w-14 place-items-center border-l border-paper/15 transition-colors group-hover:bg-marker group-hover:text-ink">
                <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
                  <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
            </a>
          </div>
        </div>

        {/* ---------- "(continua)" — o scroll indicator ---------- */}
        <div
          data-hero-continua
          data-gsap-pending
          aria-hidden
          className="pointer-events-none mt-5 flex justify-end lg:mt-4"
        >
          <span
            data-hero-continua-inner
            className="flex items-center gap-2 font-mono text-[11px] italic text-ink-faint sm:text-xs"
          >
            (continua na próxima página)
            <span data-continua-arrow className="not-italic">
              ↓
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
