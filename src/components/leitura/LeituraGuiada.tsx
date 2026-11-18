"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { FIM_NAVEGACAO, useNavegacao, useScrollTo } from "@/components/providers/SmoothScroll";
import { STOPS } from "@/content/contrato";

/**
 * fl. 02 — Leitura guiada: a pilha de cláusulas.
 *
 * Seção fixada (pin). Ao rolar, cada cláusula chega como uma folha que
 * desliza de baixo e pousa sobre a anterior; as de baixo recuam e escurecem,
 * como documentos se acumulando na mesa. A "câmera" acompanha: recua de
 * leve enquanto a folha está no ar e volta quando ela pousa.
 *
 * Câmera e folhas = timeline com scrub suavizado. Conteúdo de cada folha =
 * timeline em tempo real (stagger 0.2, power3.out) disparada quando ela pousa.
 */

const STAGGER = 0.2;
const EASE_IN = "power3.out";

// Unidades de tempo da timeline (mapeadas no scroll do pin).
const T_OPEN = 0.7;
const T_DROP = 1.1; // folha deslizando até pousar
const T_HOLD = 1.3; // folha pousada, sendo lida
const T_END = 1.0;

const TILT = [-2.2, 1.6, -1.1, 2.4]; // ângulo de pouso de cada folha (mão, não máquina)
const ORD = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª", "9ª", "10ª", "11ª"];

export function LeituraGuiada() {
  const root = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();
  const navegando = useNavegacao();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const section = root.current!;
      const stage = q("[data-stage]")[0] as HTMLElement;

      gsap.matchMedia().add(
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
          const cards = q("[data-card]") as HTMLElement[];
          const shades = cards.map((c) => c.querySelector("[data-shade]"));
          const H = () => stage.clientHeight;

          /* ---------- Abertura (coluna da esquerda) ---------- */
          gsap.set(q("[data-intro]"), { autoAlpha: 0, y: 26 });
          gsap.to(q("[data-intro]"), {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: EASE_IN,
            stagger: STAGGER,
            scrollTrigger: { trigger: section, start: "top 65%", toggleActions: "play none none reverse" },
          });

          /* ---------- Conteúdo de cada folha (tempo real) ---------- */
          const cardTls = cards.map((card) => {
            const items = card.querySelectorAll("[data-ci]");
            const marks = card.querySelectorAll("[data-mark]");
            gsap.set(items, { autoAlpha: 0, y: 18 });
            gsap.set(marks, { backgroundSize: "0% 100%" });
            return gsap
              .timeline({ paused: true })
              .to(items, { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE_IN, stagger: STAGGER })
              .to(marks, { backgroundSize: "100% 100%", duration: 1.0, ease: EASE_IN }, 0.4);
          });
          const shown = cards.map(() => false);
          const setShown = (i: number, on: boolean) => {
            if (shown[i] === on) return;
            shown[i] = on;
            const tl = cardTls[i];
            if (on) return void tl.play(0);
            tl.pause();
            gsap.to(cards[i].querySelectorAll("[data-ci]"), {
              autoAlpha: 0,
              duration: 0.7,
              ease: "power3.in",
              overwrite: true,
              onComplete: () => {
                if (!shown[i]) tl.pause(0);
              },
            });
          };

          /* ---------- Índice da esquerda + contador ---------- */
          const idx = q("[data-idx]");
          const counter = q("[data-counter]")[0];
          const ticks = q("[data-tick]");
          gsap.set(ticks, { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.set(q("[data-outro]"), { autoAlpha: 0, y: 26 });
          let active = -2;
          let outroOn = false;
          const setActive = (n: number) => {
            if (n === active) return;
            active = n;
            if (counter) counter.textContent = String(n + 1);
            idx.forEach((el, k) =>
              gsap.to(el, {
                opacity: k === n ? 1 : k < n ? 0.55 : 0.28,
                x: k === n ? 10 : 0,
                duration: 0.7,
                ease: "power3.inOut",
                overwrite: true,
              }),
            );
            ticks.forEach((t, k) =>
              gsap.to(t, { scaleX: k <= n ? 1 : 0, duration: 0.8, ease: EASE_IN, overwrite: true }),
            );
          };
          const setOutro = (on: boolean) => {
            if (on === outroOn) return;
            outroOn = on;
            gsap.to(q("[data-outro]"), {
              autoAlpha: on ? 1 : 0,
              y: on ? 0 : 26,
              duration: on ? 0.8 : 0.7,
              ease: on ? EASE_IN : "power3.in",
              stagger: on ? STAGGER : 0,
              overwrite: true,
            });
          };

          /* ---------- A pilha ---------- */
          cards.forEach((card, i) =>
            gsap.set(card, { y: () => H() * 1.05, rotation: TILT[i] * 3, transformOrigin: "50% 100%" }),
          );
          gsap.set(shades, { opacity: 0 });
          gsap.set(camera, { scale: 1, transformOrigin: "50% 60%" });

          const landings: number[] = [];
          // Paradas (labels) em progresso 0–1: usadas pelo passo-a-passo do celular.
          const labelProgress = (): number[] =>
            Object.values(tl.labels)
              .sort((a, b) => a - b)
              .map((t) => t / tl.duration());
          const tl = gsap.timeline({
            defaults: { ease: "power3.inOut" },
            onUpdate() {
              const t = tl.time();
              let n = -1;
              landings.forEach((l, i) => {
                const on = t >= l - 0.06;
                setShown(i, on);
                if (on) n = i;
              });
              setActive(n);
              setOutro(t >= tl.duration() - T_END + 0.2);
            },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              // altura do palco (100svh): estável no celular. Sem anticipatePin (ver CLAUDE.md).
              // Celular: pin mais curto, para cada cláusula caber numa passada de dedo.
              end: () => "+=" + stage.clientHeight * (desktop ? 5 : 2.9),
              pin: true,
              scrub: desktop ? 1.1 : 0.5,
              invalidateOnRefresh: true,
            },
          });

          // As paradas das pontas ficam DENTRO da seção (não no início/fim exato do
          // pin): encaixar ali nunca conta como "sair e entrar de novo".
          tl.to({}, { duration: T_OPEN });
          tl.addLabel("abertura", T_OPEN * 0.5);
          cards.forEach((card, i) => {
            const at = tl.duration();
            // a folha desliza e pousa, girando até o ângulo final
            tl.to(card, { y: 0, rotation: TILT[i], duration: T_DROP, ease: "power3.out" }, at);
            // as de baixo recuam e escurecem
            for (let j = 0; j < i; j++) {
              const d = i - j;
              tl.to(cards[j], { y: -(desktop ? 26 : 18) * d, scale: 1 - 0.055 * d, duration: T_DROP }, at);
              tl.to(shades[j], { opacity: Math.min(0.62, 0.24 * d), duration: T_DROP }, at);
            }
            // câmera: recua enquanto a folha está no ar, volta quando pousa
            tl.to(camera, { scale: 0.95, duration: T_DROP / 2, ease: "power3.out" }, at);
            tl.to(camera, { scale: 1, duration: T_DROP / 2, ease: "power3.in" }, at + T_DROP / 2);
            landings.push(at + T_DROP * 0.85);
            // ponto de encaixe: folha já pousada, um respiro antes da próxima
            tl.addLabel(`clausula-${i + 1}`, at + T_DROP + T_HOLD * 0.35);
            tl.to({}, { duration: T_HOLD });
          });
          // fecho: a pilha se ajeita e se afasta um pouco
          tl.to(camera, { scale: 0.92, duration: T_END, ease: "power3.inOut" });
          tl.addLabel("fecho", tl.duration() - T_END * 0.25);

          /* ---------- Celular: uma passada = uma cláusula ---------- */
          // Dentro da seção, o gesto vira comando: o Observer do GSAP lê a direção
          // da passada (e bloqueia a rolagem livre) e o Lenis leva a página até a
          // próxima parada. Nas pontas, o gesto devolve a rolagem e você sai.
          let stepper: ReturnType<typeof ScrollTrigger.observe> | null = null;
          if (!desktop) {
            const st = tl.scrollTrigger!;
            let parada = 0;
            let andando = false;
            const posicao = (i: number) => st.start + labelProgress()[i] * (st.end - st.start);
            const ir = (alvo: number, aoTerminar?: () => void) => {
              andando = true;
              scrollTo(alvo, {
                duration: 0.9,
                ease: "power3.inOut",
                lock: true,
                interno: true,
                onComplete: () => {
                  andando = false;
                  aoTerminar?.();
                },
              });
            };
            const passo = (dir: 1 | -1) => {
              if (andando) return;
              const n = parada + dir;
              const total = labelProgress().length;
              if (n < 0 || n >= total) {
                // saída: devolve a rolagem livre e sai da seção na direção do gesto
                stepper?.disable();
                ir(dir > 0 ? st.end + H() * 0.6 : st.start - H() * 0.6);
                return;
              }
              parada = n;
              ir(posicao(n));
            };
            stepper = ScrollTrigger.observe({
              target: window,
              type: "touch",
              tolerance: 12,
              preventDefault: true,
              onUp: () => passo(1), // dedo sobe = avançar
              onDown: () => passo(-1),
            });
            stepper.disable();
            const maisProxima = () => {
              const L = labelProgress();
              return L.reduce((m, v, i) => (Math.abs(v - st.progress) < Math.abs(L[m] - st.progress) ? i : m), 0);
            };
            // Navegação (âncora/sumário) atravessa a seção livremente; se ela
            // terminar AQUI dentro, o passo-a-passo assume da parada mais próxima.
            const aoFimDaNavegacao = () => {
              if (!st.isActive) return;
              parada = maisProxima();
              stepper?.enable();
              ir(posicao(parada));
            };
            window.addEventListener(FIM_NAVEGACAO, aoFimDaNavegacao);
            ctx.add(() => () => window.removeEventListener(FIM_NAVEGACAO, aoFimDaNavegacao));
            ScrollTrigger.create({
              trigger: section,
              start: () => st.start,
              end: () => st.end,
              // Espera um quadro e só assume se o usuário CONTINUA dentro: um salto
              // por cima da seção (restauração de scroll, "localizar na página")
              // dispara entrar+sair juntos e não pode puxar a página de volta.
              onEnter: () =>
                requestAnimationFrame(() => {
                  if (!st.isActive || navegando()) return;
                  parada = 0;
                  stepper?.enable();
                  ir(posicao(0));
                }),
              onEnterBack: () =>
                requestAnimationFrame(() => {
                  if (!st.isActive || navegando()) return;
                  parada = labelProgress().length - 1;
                  stepper?.enable();
                  ir(posicao(parada));
                }),
              onLeave: () => stepper?.disable(),
              onLeaveBack: () => stepper?.disable(),
            });
          }

          ScrollTrigger.refresh();
          return () => {
            stepper?.kill();
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
      className="group/leitura relative bg-ink-2 text-paper"
    >
      <div data-stage className="relative flex w-full flex-col overflow-hidden group-data-[mode=camera]/leitura:h-svh">
        {/* luz sobre a mesa */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_68%_55%,#1f4258_0%,#142f40_45%,#0b1d29_100%)]"
        />

        {/* ---------- Cabeçalho ---------- */}
        <div className="relative z-20 mx-auto w-full max-w-[1680px] px-4 pt-5 font-mono text-[11px] leading-none text-paper/65 sm:px-8 sm:text-xs lg:px-12">
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
          <div className="mt-3 h-px w-full bg-marker/60" />
        </div>

        <div className="relative mx-auto grid w-full max-w-[1680px] flex-1 gap-8 px-4 pb-10 pt-8 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:pb-12 lg:pt-12 group-data-[mode=camera]/leitura:min-h-0 group-data-[mode=camera]/leitura:grid-rows-[auto_1fr] lg:group-data-[mode=camera]/leitura:grid-rows-1">
          {/* ---------- Coluna da esquerda ---------- */}
          <div className="flex flex-col lg:col-span-4 lg:justify-center">
            <p data-intro data-gsap-pending className="font-mono text-xs text-paper/65 sm:text-sm">
              Um contrato de consórcio comum. Onze cláusulas.
            </p>
            <h2
              id="leitura-titulo"
              data-intro
              data-gsap-pending
              className="font-display mt-3 text-[clamp(2.2rem,9.5vw,3.4rem)] leading-[0.9] lg:mt-4 lg:text-[clamp(3rem,4.6vw,5.6rem)]"
            >
              Quatro delas <span className="text-marker">pesam</span> no seu bolso.
            </h2>

            <ol className="mt-10 hidden space-y-3 lg:block">
              {STOPS.map((c, i) => (
                <li
                  key={c.n}
                  data-intro
                  data-gsap-pending
                  className="border-b border-paper/15 pb-3"
                >
                  <span data-idx className="flex items-baseline gap-4 text-lg font-semibold [font-stretch:88%]">
                    <span className="font-mono text-xs font-normal tabular-nums text-marker">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {c.stop!.title}
                  </span>
                </li>
              ))}
            </ol>

            {/* fecho */}
            <div className="mt-8 hidden lg:block">
              <p data-outro data-gsap-pending className="font-display text-[clamp(1.8rem,2.4vw,2.6rem)] leading-[0.95]">
                Quantas estão <span className="text-marker">no seu?</span>
              </p>
              <a
                data-outro
                data-gsap-pending
                href="#contato"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#contato");
                }}
                className="group mt-5 flex max-w-sm items-stretch bg-marker text-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-marker"
              >
                <span className="flex-1 px-5 py-3.5 text-[15px] font-semibold [font-stretch:88%]">
                  Enviar meu contrato para análise
                </span>
                <span className="grid w-14 place-items-center border-l border-ink/15 transition-colors group-hover:bg-marker-2">
                  →
                </span>
              </a>
            </div>
          </div>

          {/* ---------- A pilha ---------- */}
          <div
            data-camera
            className="relative lg:col-span-7 lg:col-start-6 group-data-[mode=camera]/leitura:min-h-0"
          >
            <div className="flex flex-col gap-6 group-data-[mode=camera]/leitura:absolute group-data-[mode=camera]/leitura:inset-0 group-data-[mode=camera]/leitura:block">
              {STOPS.map((c, i) => (
                <article
                  key={c.n}
                  data-card
                  aria-label={`Cláusula ${c.n}: ${c.stop!.title}`}
                  className="w-full bg-paper text-ink shadow-[0_2px_0_rgba(0,0,0,0.15),0_40px_80px_-24px_rgba(5,15,22,0.75)] group-data-[mode=camera]/leitura:absolute group-data-[mode=camera]/leitura:inset-x-0 group-data-[mode=camera]/leitura:bottom-[6%] lg:group-data-[mode=camera]/leitura:bottom-[10%] lg:group-data-[mode=camera]/leitura:left-[4%] lg:group-data-[mode=camera]/leitura:right-[4%]"
                >
                  <div className="relative px-5 pb-6 pt-5 sm:px-9 sm:pb-9 sm:pt-7">
                    <div data-ci data-gsap-pending className="flex items-baseline justify-between gap-4 border-b border-ink/20 pb-3 font-mono text-[11px] text-ink-soft sm:text-xs">
                      <span>
                        <span className="text-ink">{String(i + 1).padStart(2, "0")}</span> · Cláusula {ORD[c.n - 1]}
                      </span>
                      <span className="text-right">{c.heading}</span>
                    </div>

                    <p data-ci data-gsap-pending className="mt-5 text-[17px] leading-[1.55] sm:mt-6 sm:text-[22px] sm:leading-[1.5]">
                      <span className="hidden sm:inline">{c.before}</span>
                      <span className="sm:hidden">…</span>
                      <span
                        data-mark
                        className="bg-[linear-gradient(transparent_50%,var(--color-marker)_50%,var(--color-marker)_92%,transparent_92%)] bg-no-repeat [-webkit-box-decoration-break:clone] [background-size:100%_100%] [box-decoration-break:clone]"
                      >
                        {c.mark}
                      </span>
                      <span className="hidden sm:inline">{c.after}</span>
                      <span className="sm:hidden">…</span>
                    </p>

                    <div className="mt-6 grid gap-2 border-t border-dashed border-ink/25 pt-5 sm:mt-8 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-8">
                      <h3 data-ci data-gsap-pending className="font-display text-[1.75rem] leading-[0.95] sm:text-[2.3rem]">
                        {c.stop!.title}
                      </h3>
                      <div>
                        <p data-ci data-gsap-pending className="text-[15px] leading-snug text-ink-soft sm:text-base">
                          {c.stop!.body}
                        </p>
                        <p data-ci data-gsap-pending className="mt-3 font-mono text-[11px] text-ink-faint">
                          ↳ {c.stop!.ref}
                        </p>
                      </div>
                    </div>

                    {/* sombra das folhas que ficam por baixo */}
                    <div data-shade aria-hidden className="pointer-events-none absolute inset-0 bg-ink-2 opacity-0" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
