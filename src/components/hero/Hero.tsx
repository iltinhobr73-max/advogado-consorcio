"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useScrollTo } from "@/components/providers/SmoothScroll";

const LINE_ONE = "Seu consórcio";
const HEADLINE = "Seu consórcio tem regras. A administradora também.";

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

          // GSAP assume o controle da visibilidade (remove o anti-flash).
          gsap.set(q("[data-gsap-pending]"), { autoAlpha: 1 });

          if (reduce) {
            video.current?.pause();
            gsap.set(q("[data-hero-video]"), { autoAlpha: 0.55 });
            gsap.set(q("[data-hero-caret]"), { autoAlpha: 0 });
            return;
          }

          /* ---------- Estado inicial ---------- */
          gsap.set(q("[data-hero-video]"), { autoAlpha: 0, scale: 1.18 });
          gsap.set(q("[data-hero-caret]"), { autoAlpha: 0 });
          gsap.set(q("[data-hero-rule]"), { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.set(q("[data-hero-meta]"), { yPercent: 110 });
          gsap.set(q("[data-hero-char]"), { yPercent: 115 });
          gsap.set(q("[data-hero-line-one]"), { letterSpacing: "0.38em" });
          gsap.set(q("[data-hero-line]"), { yPercent: 115, rotate: 2.5 });
          gsap.set(q("[data-hero-fade]"), { autoAlpha: 0, y: 24 });
          gsap.set(q("[data-hero-indicator]"), { autoAlpha: 0 });

          /* ---------- Intro: silêncio, cursor, linha... e só então a palavra ---------- */
          const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.25 });

          tl
            // 1. Escuro total. Um cursor surge onde a frase vai nascer e pisca —
            //    a página "respira" antes de falar.
            .set(q("[data-hero-caret]"), { autoAlpha: 1 }, 0.35)
            .to(
              q("[data-hero-caret]"),
              { autoAlpha: 0, duration: 0.42, repeat: 3, yoyo: true, ease: "steps(1)" },
              0.6,
            )
            // 2. A linha fina atravessa a tela devagar, como uma régua sendo puxada.
            .to(q("[data-hero-rule]"), { scaleX: 1, duration: 1.6, ease: "expo.inOut" }, 0.5)
            .to(q("[data-hero-meta]"), { yPercent: 0, duration: 1, stagger: 0.08 }, 1.25)
            // 3. A luz do vídeo vem por trás, lenta.
            .to(
              q("[data-hero-video]"),
              { autoAlpha: 0.6, scale: 1, duration: 3.2, ease: "power2.out" },
              1.3,
            )
            // 4. O cursor se recolhe — e a primeira palavra sobe, ainda espaçada,
            //    e se comprime até o tracking final.
            .to(q("[data-hero-caret]"), { autoAlpha: 1, duration: 0.01 }, 2.2)
            .to(q("[data-hero-caret]"), { scaleY: 0, duration: 0.35, ease: "power3.in" }, 2.22)
            .to(q("[data-hero-char]"), { yPercent: 0, duration: 1.2, stagger: 0.032 }, 2.45)
            .to(
              q("[data-hero-line-one]"),
              { letterSpacing: "-0.02em", duration: 1.9, ease: "expo.out" },
              2.45,
            )
            // 5. O resto da frase entra em bloco, linha a linha.
            .to(
              q("[data-hero-line]"),
              { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.13 },
              3.05,
            )
            .to(q("[data-hero-fade]"), { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.1 }, 3.6)
            .to(q("[data-hero-indicator]"), { autoAlpha: 1, duration: 1 }, 4.1);

          /* ---------- Indicador: ponto descendo pela linha, em loop ---------- */
          const dot = q("[data-hero-dot]");
          gsap
            .timeline({ repeat: -1, repeatDelay: 0.3 })
            .fromTo(dot, { yPercent: -100 }, { yPercent: 900, duration: 1.6, ease: "power2.inOut" }, 0)
            .fromTo(dot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "none" }, 0)
            .to(dot, { autoAlpha: 0, duration: 0.35, ease: "none" }, 1.25);

          /* ---------- Scroll ---------- */
          // Indicador some nos primeiros pixels de descida.
          gsap.to(q("[data-hero-indicator-inner]"), {
            autoAlpha: 0,
            y: 28,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "+=180", scrub: true },
          });

          // Parallax sutil: vídeo desce devagar, conteúdo sobe e apaga.
          gsap.to(q("[data-hero-video-wrap]"), {
            yPercent: 18,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
          });
          gsap.to(q("[data-hero-content]"), {
            y: -90,
            autoAlpha: 0.15,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
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
      className="relative isolate flex h-svh min-h-[640px] w-full flex-col overflow-hidden bg-ink"
    >
      {/* ---------- Vídeo de fundo ---------- */}
      <div data-hero-video-wrap aria-hidden className="absolute inset-0 -z-10">
        <video
          ref={video}
          data-hero-video
          data-gsap-pending
          className="h-full w-full object-cover opacity-60"
          src="/media/hero.mp4"
          poster="/media/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        {/* Véu para contraste do texto */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_60%,transparent_0%,rgba(11,12,14,0.55)_55%,rgba(11,12,14,0.95)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      </div>

      {/* ---------- Conteúdo ---------- */}
      <div
        data-hero-content
        className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-between px-5 pb-10 pt-6 sm:px-10 sm:pb-12 sm:pt-8 lg:px-16"
      >
        {/* Barra superior */}
        <div
          data-gsap-pending
          className="flex items-start justify-between gap-4 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-bone-dim sm:text-xs sm:tracking-[0.22em]"
        >
          <span className="block overflow-hidden">
            <span data-hero-meta className="block">
              Advocacia <span className="text-brass">·</span> Consórcios
            </span>
          </span>
          <span className="block overflow-hidden text-right">
            <span data-hero-meta className="block">
              Direito do Consumidor
            </span>
          </span>
        </div>

        {/* Título */}
        <div className="mt-auto">
          <div data-gsap-pending>
            <div data-hero-rule className="mb-6 h-px w-full bg-bone/25 sm:mb-10" />

            <h1 className="font-serif text-[clamp(2.6rem,12.4vw,10.5rem)] md:text-[clamp(3.1rem,10.4vw,10.5rem)] leading-[0.9] tracking-[-0.02em] text-bone">
              <span className="sr-only">{HEADLINE}</span>

              <span aria-hidden className="block">
                {/* Linha 1: letra a letra, com o cursor de tensão */}
                <span className="relative block overflow-hidden pb-[0.06em]">
                  <span
                    data-hero-caret
                    className="absolute left-0 top-[0.12em] h-[0.78em] w-[3px] origin-bottom bg-brass"
                  />
                  <span data-hero-line-one className="block whitespace-nowrap">
                    {Array.from(LINE_ONE).map((ch, i) => (
                      <span key={i} data-hero-char className="inline-block will-change-transform">
                        {ch === " " ? " " : ch}
                      </span>
                    ))}
                  </span>
                </span>

                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-hero-line className="block origin-[0%_100%] whitespace-nowrap">
                    tem regras.
                  </span>
                </span>
                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-hero-line className="block origin-[0%_100%] whitespace-nowrap text-bone/55">
                    A administradora
                  </span>
                </span>
                <span className="block overflow-hidden pb-[0.1em]">
                  <span data-hero-line className="block origin-[0%_100%] whitespace-nowrap italic text-brass">
                    também.
                  </span>
                </span>
              </span>
            </h1>
          </div>

          {/* Rodapé do hero */}
          <div className="mt-8 flex flex-col gap-8 sm:mt-12 md:flex-row md:items-end md:justify-between">
            <p
              data-gsap-pending
              data-hero-fade
              className="max-w-md text-base leading-relaxed text-bone-dim sm:text-lg"
            >
              Contratos abusivos, taxas indevidas, promessas de contemplação e
              restituição de valores — cada caso analisado individualmente.
            </p>

            <div data-gsap-pending data-hero-fade className="flex items-center gap-6">
              <a
                href="#contato"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#contato");
                }}
                className="group inline-flex items-center gap-4 rounded-full border border-bone/25 py-3 pl-6 pr-3 text-sm font-medium tracking-wide text-bone transition-colors hover:border-brass hover:bg-brass hover:text-ink"
              >
                Analisar meu caso
                <span className="grid size-9 place-items-center rounded-full bg-bone text-ink transition-colors group-hover:bg-ink group-hover:text-brass">
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
                    <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Scroll indicator ---------- */}
      <div
        data-hero-indicator
        data-gsap-pending
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
      >
        <div data-hero-indicator-inner className="flex flex-col items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.35em] text-bone-dim">Role</span>
          <span className="relative block h-14 w-px overflow-hidden bg-bone/15">
            <span data-hero-dot className="absolute left-0 top-0 block h-1.5 w-px bg-brass" />
          </span>
        </div>
      </div>
    </section>
  );
}
