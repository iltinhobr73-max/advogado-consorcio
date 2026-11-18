"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useScrollTo } from "@/components/providers/SmoothScroll";
import { CLAUSES, STOPS } from "@/content/contrato";

/**
 * fl. 02 — Leitura guiada: "a letra miúda, em letra graúda".
 *
 * Seção fixada (pin). Uma câmera faz um travelling horizontal por 6 planos:
 * abertura → 4 cláusulas → fecho. Em cada cláusula, a frase aparece em
 * letra miúda (mono) e o trecho problemático em tipografia gigante, que o
 * marca-texto atravessa.
 *
 * Câmera = timeline com scrub suavizado: entre planos ela recua de leve e
 * volta (dolly) e o numeral gigante de cada plano corre em outra
 * velocidade (profundidade). Conteúdo de cada plano = timeline em tempo
 * real (stagger 0.2, power3.out) disparada quando a câmera chega.
 *
 * Trilho com 6 planos: largura 600% e cada plano 1/6 (classes literais —
 * o Tailwind só gera classes escritas por extenso). Mudou o nº de planos?
 * Ajuste w-[600%] e w-1/6.
 */

const STAGGER = 0.2;
const EASE_IN = "power3.out";
const INK = "#0e0e0d";
const PAPER = "#f5f2eb";

// Unidades de tempo da timeline da câmera (mapeadas no scroll do pin).
const T_OPEN = 0.9; // plano de abertura parado
const T_TRAVEL = 1.1; // travelling entre planos
const T_HOLD = 1.25; // câmera parada num plano
const T_END = 0.6;

const ORD = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª", "9ª", "10ª", "11ª"];

export function LeituraGuiada() {
  const root = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const section = root.current!;
      const stage = q("[data-stage]")[0] as HTMLElement;
      const mm = gsap.matchMedia();

      // Seta do "role" cutucando para a direita.
      gsap.to(q("[data-nudge]"), { x: 8, duration: 1.1, ease: "power3.inOut", yoyo: true, repeat: -1 });

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 1024px)",
        },
        (ctx) => {
          const { reduce, desktop } = ctx.conditions as { reduce: boolean; desktop: boolean };
          gsap.set(q("[data-gsap-pending]"), { autoAlpha: 1 });

          if (reduce) {
            section.dataset.mode = "static";
            return;
          }
          section.dataset.mode = "camera";

          const camera = q("[data-camera]")[0];
          const track = q("[data-track]")[0];
          const panels = q("[data-panel]") as HTMLElement[];
          const depths = panels.map((p) => p.querySelector("[data-depth]"));
          const W = () => stage.clientWidth;

          /* ---------- Conteúdo de cada plano (tempo real) ---------- */
          const panelTls = panels.map((panel) => {
            const items = panel.querySelectorAll("[data-pi]");
            const marks = panel.querySelectorAll("[data-mark]");
            gsap.set(items, { autoAlpha: 0, y: 30 });
            gsap.set(marks, { backgroundSize: "0% 100%", color: PAPER });
            return gsap
              .timeline({ paused: true })
              .to(items, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE_IN, stagger: STAGGER })
              // o marca-texto atravessa a frase gigante; a tinta escurece junto
              .to(marks, { backgroundSize: "100% 100%", color: INK, duration: 1.0, ease: EASE_IN, stagger: STAGGER }, 0.6);
          });
          const shown = panels.map(() => false);
          const setShown = (i: number, on: boolean) => {
            if (shown[i] === on) return;
            shown[i] = on;
            const tl = panelTls[i];
            if (on) {
              tl.play(0);
              return;
            }
            // saída própria: some em 0.7s (não é a entrada rebobinada acelerada)
            tl.pause();
            gsap.to(panels[i].querySelectorAll("[data-pi]"), {
              autoAlpha: 0,
              duration: 0.7,
              ease: "power3.in",
              overwrite: true,
              onComplete: () => {
                if (!shown[i]) tl.pause(0);
              },
            });
          };

          // Abertura: entra quando a seção chega na tela.
          ScrollTrigger.create({
            trigger: section,
            start: "top 65%",
            onEnter: () => setShown(0, true),
            onLeaveBack: () => setShown(0, false),
          });

          /* ---------- Cabeçalho: contador e réguas ---------- */
          const counter = q("[data-counter]")[0];
          const ticks = q("[data-tick]");
          gsap.set(ticks, { scaleX: 0, transformOrigin: "0% 50%" });
          let reached = -1;
          const setReached = (n: number) => {
            if (n === reached) return;
            reached = n;
            if (counter) counter.textContent = String(n);
            ticks.forEach((t, i) =>
              gsap.to(t, { scaleX: i < n ? 1 : 0, duration: 0.8, ease: EASE_IN, overwrite: true }),
            );
          };

          /* ---------- Câmera ---------- */
          const arrivals: number[] = [0]; // tempo em que a câmera chega a cada plano
          gsap.set(track, { x: 0 });
          gsap.set(camera, { scale: 1, transformOrigin: "50% 50%" });

          const cam = gsap.timeline({
            defaults: { ease: "power3.inOut" },
            onUpdate() {
              const t = cam.time();
              arrivals.forEach((a, i) => i > 0 && setShown(i, t >= a - 0.08));
              setReached(arrivals.slice(1, STOPS.length + 1).filter((a) => t >= a - 0.08).length);
            },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              // altura do palco (100svh): estável no celular. Sem anticipatePin (ver CLAUDE.md).
              end: () => "+=" + stage.clientHeight * (desktop ? 6.5 : 5.5),
              pin: true,
              scrub: 1.1,
              invalidateOnRefresh: true,
            },
          });

          cam.to({}, { duration: T_OPEN });
          for (let i = 1; i < panels.length; i++) {
            const at = cam.duration();
            // travelling lateral
            cam.to(track, { x: () => -W() * i, duration: T_TRAVEL }, at);
            // dolly: a câmera recua no meio do movimento e volta ao chegar
            cam.to(camera, { scale: desktop ? 0.86 : 0.92, duration: T_TRAVEL / 2, ease: "power3.out" }, at);
            cam.to(camera, { scale: 1, duration: T_TRAVEL / 2, ease: "power3.in" }, at + T_TRAVEL / 2);
            // profundidade: o numeral do plano que chega e o do que sai correm em outra velocidade
            if (depths[i]) cam.fromTo(depths[i], { x: () => W() * 0.45 }, { x: 0, duration: T_TRAVEL, immediateRender: true }, at);
            if (depths[i - 1]) cam.to(depths[i - 1], { x: () => -W() * 0.45, duration: T_TRAVEL }, at);
            arrivals.push(at + T_TRAVEL);
            // parada com respiração: a câmera avança um pouco, nunca fica totalmente morta
            cam.to(camera, { scale: 1.025, duration: T_HOLD }, at + T_TRAVEL);
          }
          cam.to({}, { duration: T_END });

          ScrollTrigger.refresh();
          return () => {
            delete section.dataset.mode;
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="leitura"
      aria-labelledby="leitura-titulo"
      className="group/leitura relative bg-ink text-paper"
    >
      <div data-stage className="relative w-full overflow-hidden group-data-[mode=camera]/leitura:h-svh">
        {/* Mesa escura com luz */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_75%_at_50%_45%,#24231f_0%,#121211_60%,#0a0a09_100%)]"
        />

        {/* ---------- Cabeçalho ---------- */}
        <div className="pointer-events-none relative z-20">
          <div className="mx-auto max-w-[1680px] px-4 pt-5 font-mono text-[11px] leading-none text-paper/60 sm:px-8 sm:text-xs lg:px-12">
            <div className="flex items-baseline justify-between gap-4">
              <span>Leitura guiada</span>
              <span className="flex items-center gap-3">
                <span className="hidden gap-1 sm:group-data-[mode=camera]/leitura:flex" aria-hidden>
                  {STOPS.map((s) => (
                    <span key={s.n} className="relative block h-px w-6 bg-paper/25">
                      <span data-tick className="absolute inset-0 bg-marker" />
                    </span>
                  ))}
                </span>
                <span className="hidden group-data-[mode=camera]/leitura:inline">
                  cláusula <span data-counter>0</span>/{STOPS.length}
                </span>
              </span>
              <span>fl. 02</span>
            </div>
            <div className="mt-3 h-px w-full bg-paper/50" />
          </div>
        </div>

        {/* ---------- Câmera → trilho de 6 planos ---------- */}
        <div
          data-camera
          className="relative group-data-[mode=camera]/leitura:absolute group-data-[mode=camera]/leitura:inset-0"
        >
          <div
            data-track
            className="flex flex-col group-data-[mode=camera]/leitura:h-full group-data-[mode=camera]/leitura:w-[600%] group-data-[mode=camera]/leitura:flex-row"
          >
            {/* Plano 0 — abertura */}
            <article
              data-panel
              className="relative w-full shrink-0 overflow-hidden group-data-[mode=camera]/leitura:h-full group-data-[mode=camera]/leitura:w-1/6"
            >
              <div className="mx-auto grid h-full max-w-[1680px] content-center gap-10 px-4 pb-16 pt-14 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-12 lg:pb-12 lg:pt-20">
                <div className="lg:col-span-6">
                  <p data-pi data-gsap-pending className="font-mono text-xs text-paper/60 sm:text-sm">
                    Um contrato de consórcio comum. Onze cláusulas.
                  </p>
                  <h2
                    id="leitura-titulo"
                    data-pi
                    data-gsap-pending
                    className="font-display mt-4 text-[clamp(2.7rem,11.5vw,4.4rem)] leading-[0.88] lg:text-[clamp(3.6rem,6.4vw,8rem)]"
                  >
                    Quatro delas <span className="bg-marker px-[0.06em] text-ink">pesam</span> no seu bolso.
                  </h2>
                  <p
                    data-pi
                    data-gsap-pending
                    className="mt-8 hidden items-center gap-3 font-mono text-xs text-paper/70 sm:text-sm group-data-[mode=camera]/leitura:flex"
                  >
                    Role para ler, cláusula por cláusula
                    <span data-nudge aria-hidden className="inline-block">→</span>
                  </p>
                </div>
                {/* A letra miúda: o contrato inteiro, pequeno de propósito */}
                <div
                  data-pi
                  data-gsap-pending
                  aria-hidden
                  className="relative max-h-[34svh] overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent)] lg:col-span-5 lg:col-start-8 lg:max-h-[64svh]"
                >
                  <div className="columns-2 gap-5 text-justify font-mono text-[8.5px] leading-[1.55] text-paper/40 lg:gap-6 lg:text-[9.5px]">
                    {CLAUSES.map((c) => (
                      <p key={c.n} className="mb-2.5">
                        <span className="text-paper/70">
                          CLÁUSULA {ORD[c.n - 1]} — {c.heading.toUpperCase()}.{" "}
                        </span>
                        {c.before}
                        {c.mark && (
                          <span className="text-paper underline decoration-marker decoration-2 underline-offset-2">
                            {c.mark}
                          </span>
                        )}
                        {c.after}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* Planos 1–4 — as cláusulas */}
            {STOPS.map((c, i) => (
              <article
                key={c.n}
                data-panel
                aria-label={`Cláusula ${c.n}: ${c.stop!.title}`}
                className="relative w-full shrink-0 overflow-hidden border-t border-paper/10 group-data-[mode=camera]/leitura:h-full group-data-[mode=camera]/leitura:w-1/6 group-data-[mode=camera]/leitura:border-t-0"
              >
                {/* numeral gigante ao fundo (camada de profundidade) */}
                <span
                  data-depth
                  aria-hidden
                  className="font-display pointer-events-none absolute -bottom-[0.16em] -right-[0.03em] select-none text-[64vw] leading-none text-paper/[0.05] lg:text-[40vw]"
                >
                  {ORD[c.n - 1]}
                </span>

                <div className="relative mx-auto grid h-full max-w-[1680px] content-center gap-8 px-4 pb-20 pt-16 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:pb-12 lg:pt-20">
                  <div className="lg:col-span-7">
                    <p data-pi data-gsap-pending className="flex items-baseline gap-3 font-mono text-xs text-paper/60">
                      <span className="tabular-nums text-marker">{String(i + 1).padStart(2, "0")}</span>
                      Cláusula {ORD[c.n - 1]} — {c.heading}
                    </p>
                    {/* a letra miúda */}
                    <p
                      data-pi
                      data-gsap-pending
                      className="mt-4 max-w-[62ch] font-mono text-[10.5px] leading-[1.6] text-paper/45 sm:text-xs lg:mt-5"
                    >
                      {c.before}
                      <span className="text-paper/85">{c.mark}</span>
                      {c.after}
                    </p>
                    {/* …em letra graúda */}
                    <blockquote
                      data-pi
                      data-gsap-pending
                      className="font-display mt-6 text-[clamp(1.85rem,8.2vw,3rem)] leading-[1.04] lg:mt-10 lg:text-[clamp(2.6rem,4.2vw,5.2rem)] lg:leading-[1]"
                    >
                      “
                      <span
                        data-mark
                        className="bg-[linear-gradient(var(--color-marker),var(--color-marker))] bg-no-repeat px-[0.06em] text-ink [-webkit-box-decoration-break:clone] [background-size:100%_100%] [box-decoration-break:clone]"
                      >
                        {c.mark}
                      </span>
                      ”
                    </blockquote>
                  </div>

                  <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
                    <span data-pi data-gsap-pending className="block h-px w-full bg-paper/30" />
                    <h3
                      data-pi
                      data-gsap-pending
                      className="font-display mt-4 text-[1.9rem] leading-[0.92] lg:mt-5 lg:text-[clamp(2.2rem,2.9vw,3.4rem)]"
                    >
                      {c.stop!.title}
                    </h3>
                    <p data-pi data-gsap-pending className="mt-3 text-[15px] leading-snug text-paper/90 lg:mt-4 lg:text-lg">
                      {c.stop!.body}
                    </p>
                    <p data-pi data-gsap-pending className="mt-3 font-mono text-[11px] text-paper/55 lg:mt-4 lg:text-xs">
                      ↳ {c.stop!.ref}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            {/* Plano 5 — fecho */}
            <article
              data-panel
              className="relative w-full shrink-0 overflow-hidden border-t border-paper/10 group-data-[mode=camera]/leitura:h-full group-data-[mode=camera]/leitura:w-1/6 group-data-[mode=camera]/leitura:border-t-0"
            >
              <div className="mx-auto grid h-full max-w-[1680px] content-center gap-10 px-4 pb-20 pt-16 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:pb-12 lg:pt-20">
                <div className="lg:col-span-7">
                  <p data-pi data-gsap-pending className="font-mono text-xs text-paper/60 sm:text-sm">
                    Quatro marcações em um contrato padrão.
                  </p>
                  <p
                    data-pi
                    data-gsap-pending
                    className="font-display mt-4 text-[clamp(2.7rem,11.5vw,4.4rem)] leading-[0.88] lg:text-[clamp(3.6rem,6.4vw,8rem)]"
                  >
                    Quantas estão <span className="whitespace-nowrap bg-marker px-[0.06em] text-ink">no seu?</span>
                  </p>
                </div>
                <div className="lg:col-span-4 lg:col-start-9">
                  <ul className="space-y-3 font-mono text-xs text-paper/80 sm:text-sm">
                    {STOPS.map((c) => (
                      <li key={c.n} data-pi data-gsap-pending className="flex items-center gap-3 border-b border-paper/15 pb-3">
                        <span aria-hidden className="grid size-4 place-items-center border border-paper/70 text-[11px] leading-none text-marker">
                          ×
                        </span>
                        {c.stop!.title}
                      </li>
                    ))}
                  </ul>
                  <a
                    data-pi
                    data-gsap-pending
                    href="#contato"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo("#contato");
                    }}
                    className="group mt-8 flex items-stretch bg-paper text-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-paper"
                  >
                    <span className="flex-1 px-5 py-3.5 text-[15px] font-semibold [font-stretch:88%]">
                      Enviar meu contrato para análise
                    </span>
                    <span className="grid w-14 place-items-center border-l border-ink/15 transition-colors group-hover:bg-marker">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
