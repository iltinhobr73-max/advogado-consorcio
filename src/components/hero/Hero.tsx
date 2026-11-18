"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useScrollTo } from "@/components/providers/SmoothScroll";
import { ESCRITORIO, WHATSAPP_URL } from "@/content/escritorio";
import { Logo } from "@/components/doc/Logo";

/**
 * fl. 01 — Hero.
 * Vídeo em loop (luz de janela atravessando a persiana, nas cores da marca).
 * Tensão tipográfica: antes de qualquer palavra, o título aparece só como
 * CONTORNO dourado, vazio. Ele fica em suspenso; então cada linha é
 * preenchida da esquerda para a direita, como tinta entrando na letra.
 */

const LINES = [
  { text: "Seu dinheiro", gold: false },
  { text: "do consórcio", gold: false },
  { text: "pode voltar.", gold: true },
];
const HEADLINE = LINES.map((l) => l.text).join(" ");
const VIDEO_ALPHA = 0.85;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { reduce } = ctx.conditions as { reduce: boolean };
          gsap.set(q("[data-gsap-pending]"), { autoAlpha: 1 });
          if (reduce) {
            video.current?.pause();
            return;
          }

          /* ---------- Estado inicial ---------- */
          gsap.set(q("[data-hero-video]"), { autoAlpha: 0, scale: 1.08 });
          gsap.set(q("[data-hero-meta]"), { autoAlpha: 0, y: -10 });
          gsap.set(q("[data-hero-rule]"), { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.set(q("[data-outline]"), { autoAlpha: 0, y: 24 });
          // Folga em cima/embaixo: o recorte não pode cortar acentos e pernas (p, ç).
          gsap.set(q("[data-fill]"), { clipPath: "inset(-15% 100% -35% 0%)" });
          gsap.set(q("[data-hero-fade]"), { autoAlpha: 0, y: 22 });
          gsap.set(q("[data-hero-indicator]"), { autoAlpha: 0 });

          gsap
            .timeline({ delay: 0.2 })
            // 1. A luz entra pela janela.
            .to(q("[data-hero-video]"), { autoAlpha: VIDEO_ALPHA, scale: 1, duration: 2.4, ease: "power3.out" }, 0)
            .to(q("[data-hero-meta]"), { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.2 }, 0.2)
            .to(q("[data-hero-rule]"), { scaleX: 1, duration: 1.2, ease: "expo.inOut" }, 0.3)
            // 2. A frase aparece VAZIA: só o contorno dourado. Dá para ver a forma, não o peso.
            .to(q("[data-outline]"), { autoAlpha: 1, y: 0, duration: 1.0, ease: "power3.out", stagger: 0.2 }, 0.6)
            // 3. Suspensão… e a tinta preenche cada linha, da esquerda para a direita.
            .to(
              q("[data-fill]"),
              { clipPath: "inset(-15% 0% -35% 0%)", duration: 1.1, ease: "expo.inOut", stagger: 0.2 },
              2.0,
            )
            // 4. O resto da página.
            .to(q("[data-hero-fade]"), { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.2 }, 2.9)
            .to(q("[data-hero-indicator]"), { autoAlpha: 1, duration: 0.8, ease: "power3.out" }, 3.6);

          // Ponto descendo pela linha do indicador.
          gsap
            .timeline({ repeat: -1, repeatDelay: 0.4 })
            .fromTo(q("[data-hero-dot]"), { y: 0, autoAlpha: 0 }, { y: 44, autoAlpha: 1, duration: 1.2, ease: "power3.inOut" })
            .to(q("[data-hero-dot]"), { autoAlpha: 0, duration: 0.6, ease: "power3.in" });

          /* ---------- Scroll ---------- */
          const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
          gsap.to(q("[data-hero-indicator-inner]"), {
            autoAlpha: 0,
            y: 20,
            ease: "power3.out",
            scrollTrigger: { trigger: root.current, start: "top top", end: "+=160", scrub: true },
          });
          gsap.to(q("[data-hero-video-wrap]"), { yPercent: 14, ease: "power3.inOut", scrollTrigger: st });
          gsap.to(q("[data-hero-content]"), { y: -70, autoAlpha: 0.2, ease: "power3.inOut", scrollTrigger: st });
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      aria-label="Apresentação"
      className="relative isolate flex h-svh min-h-[640px] w-full flex-col overflow-hidden bg-ink text-paper"
    >
      {/* ---------- Vídeo de fundo ---------- */}
      <div data-hero-video-wrap aria-hidden className="absolute inset-0 -z-10">
        <video
          ref={video}
          data-hero-video
          className="h-full w-full object-cover opacity-85"
          src="/media/escritorio.mp4"
          poster="/media/escritorio-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        {/* véu para o texto à esquerda */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,34,49,0.92)_0%,rgba(13,34,49,0.55)_48%,rgba(13,34,49,0.1)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-2/80 to-transparent" />
      </div>

      <div
        data-hero-content
        className="relative mx-auto flex w-full max-w-[1680px] flex-1 flex-col px-4 pb-7 pt-5 sm:px-8 sm:pb-9 lg:px-12"
      >
        {/* ---------- Cabeçalho ---------- */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <span data-hero-meta data-gsap-pending>
              <Logo className="h-14 sm:h-[72px]" />
            </span>
            <span data-hero-meta data-gsap-pending className="hidden font-mono text-xs text-paper/65 md:inline">
              {ESCRITORIO.oabs.join("  ·  ")}
            </span>
            <span data-hero-meta data-gsap-pending className="font-mono text-[11px] text-paper/65 sm:text-xs">
              fl. 01
            </span>
          </div>
          <div data-hero-rule className="mt-4 h-px w-full bg-marker/60" />
        </div>

        {/* ---------- Título ---------- */}
        <h1 className="my-auto pt-10">
          <span className="sr-only">{HEADLINE}</span>
          <span aria-hidden className="block">
            {LINES.map((l) => (
              <span
                key={l.text}
                className="font-display relative block whitespace-nowrap text-[clamp(3.1rem,15vw,13.5rem)] leading-[0.86] tracking-[-0.012em] md:text-[clamp(3.4rem,11.6vw,13.5rem)]"
              >
                {/* contorno (aparece primeiro, vazio) */}
                <span data-outline data-gsap-pending className="block text-transparent [-webkit-text-stroke:1.5px_var(--color-marker)]">
                  {l.text}
                </span>
                {/* preenchimento (entra depois, da esquerda para a direita) */}
                <span
                  data-fill
                  className={`absolute inset-0 block ${l.gold ? "text-marker" : "text-paper"}`}
                >
                  {l.text}
                </span>
              </span>
            ))}
          </span>
        </h1>

        {/* ---------- Rodapé do hero ---------- */}
        <div className="mt-8 grid gap-7 md:grid-cols-[minmax(0,34rem)_auto] md:items-end md:justify-between">
          <p data-hero-fade data-gsap-pending className="max-w-[34rem] text-base leading-relaxed text-paper/85 sm:text-lg">
            Desistiu, foi excluído do grupo ou caiu numa promessa de contemplação? A gente analisa o seu
            contrato e explica, por escrito, o que pode ser recuperado.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch md:justify-end">
            <a
              data-hero-fade
              data-gsap-pending
              href="#contato"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#contato");
              }}
              className="group flex items-stretch bg-marker text-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-marker"
            >
              <span className="flex flex-1 items-center px-5 py-3.5 text-[15px] font-semibold [font-stretch:88%] sm:px-6">
                Analisar meu contrato
              </span>
              <span className="grid w-14 place-items-center border-l border-ink/15 transition-colors group-hover:bg-marker-2">
                →
              </span>
            </a>
            <a
              data-hero-fade
              data-gsap-pending
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 border border-paper/35 px-5 py-3.5 text-[15px] font-semibold text-paper [font-stretch:88%] transition-colors hover:border-marker hover:text-marker sm:px-6"
            >
              WhatsApp <span className="font-mono text-xs font-normal text-paper/60">{ESCRITORIO.whatsapp.exibicao}</span>
            </a>
          </div>
        </div>

        <ul
          data-hero-fade
          data-gsap-pending
          className="mt-7 flex flex-wrap gap-x-6 gap-y-1 border-t border-paper/15 pt-4 font-mono text-[11px] text-paper/60 sm:text-xs"
        >
          <li className="md:hidden">{ESCRITORIO.oabs.join(" · ")}</li>
          <li>Restituição de valores</li>
          <li>Cláusulas abusivas</li>
          <li>Golpes e falsas promessas</li>
          <li>Atendimento online · {ESCRITORIO.cidade}</li>
        </ul>
      </div>

      {/* ---------- Scroll indicator ---------- */}
      <div
        data-hero-indicator
        data-gsap-pending
        aria-hidden
        className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block xl:right-10"
      >
        <div data-hero-indicator-inner className="flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] text-paper/60 [writing-mode:vertical-rl]">role</span>
          <span className="relative block h-14 w-px overflow-hidden bg-paper/20">
            <span data-hero-dot className="absolute left-0 top-0 block h-2.5 w-px bg-marker" />
          </span>
        </div>
      </div>
    </section>
  );
}
