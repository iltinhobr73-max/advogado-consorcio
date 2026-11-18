"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CLAUSES, STOPS } from "@/content/contrato";

/**
 * "Leitura guiada": seção fixada (pin) em que uma câmera percorre um
 * contrato de consórcio. O movimento da câmera é atrelado ao scroll com
 * inércia (scrub suavizado); as anotações de cada parada rodam em tempo
 * real, em sequência de 0.2s, com power3.out.
 */

const STAGGER = 0.2;
const EASE_IN = "power3.out";

// Unidades de tempo da timeline da câmera (mapeadas no scroll do pin).
const T_INTRO = 0.6; // contrato na mesa, antes do mergulho
const T_TRAVEL = 1; // deslocamento entre enquadramentos
const T_HOLD = 1.15; // câmera parada na cláusula
const T_OUTRO = 1.3; // recuo final
const T_END_HOLD = 0.7;

type Pose = { x: number; y: number; scale: number; rotation: number; rotationX: number };

/** Posição de um elemento no sistema de coordenadas do documento (sem transformações). */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

export function LeituraGuiada() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const section = root.current!;
      const stage = q("[data-stage]")[0] as HTMLElement;
      const doc = q("[data-doc]")[0] as HTMLElement;
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 1024px)",
        },
        (ctx) => {
          const { reduce, desktop } = ctx.conditions as { reduce: boolean; desktop: boolean };

          gsap.set(q("[data-gsap-pending]"), { autoAlpha: 1 });

          // Sem movimento: versão estática (notas em grade, marcações aplicadas).
          if (reduce) {
            section.dataset.mode = "static";
            gsap.set(q("[data-mark]"), { backgroundSize: "100% 100%" });
            return;
          }

          section.dataset.mode = "camera";

          const notes = q("[data-note]");
          const marks = q("[data-mark]");
          const stops = q("[data-stop]");

          /* ---------- Enquadramentos (recalculados a cada refresh) ---------- */
          const docSize = () => ({ w: doc.offsetWidth, h: doc.offsetHeight });

          const overview = (flat: boolean): Pose => {
            const W = stage.clientWidth;
            const H = stage.clientHeight;
            const { w, h } = docSize();
            if (desktop) {
              const s = Math.min((H * 0.84) / h, (W * 0.44) / w);
              return {
                x: W * 0.71 - (w * s) / 2,
                y: (H - h * s) / 2 + H * 0.02,
                scale: s,
                rotation: flat ? 0 : -3.5,
                rotationX: flat ? 0 : 14,
              };
            }
            const s = Math.min((H * 0.5) / h, (W * 0.78) / w);
            return {
              x: (W - w * s) / 2,
              y: H * 0.44,
              scale: s,
              rotation: flat ? 0 : -3,
              rotationX: flat ? 0 : 12,
            };
          };

          const framing = (i: number): Pose => {
            const W = stage.clientWidth;
            const H = stage.clientHeight;
            const r = offsetWithin(stops[i] as HTMLElement, doc);
            // Desktop: cláusula à esquerda, anotação na coluna da direita.
            // Mobile: cláusula no terço superior, anotação embaixo.
            const frameX = desktop ? W * 0.335 : W * 0.5;
            const frameY = desktop ? H * 0.52 : H * 0.3;
            const targetW = desktop ? W * 0.6 : W * 0.93;
            const s = gsap.utils.clamp(0.4, 2.6, targetW / r.w);
            // Pequena variação de ângulo por parada: câmera na mão, não slide.
            const tilt = [-1.2, 0.9, -0.6, 1.1][i] ?? 0;
            return {
              x: frameX - (r.x + r.w / 2) * s,
              y: frameY - (r.y + r.h / 2) * s,
              scale: s,
              rotation: tilt,
              rotationX: 0,
            };
          };

          const poseTween = (get: () => Pose) => ({
            x: () => get().x,
            y: () => get().y,
            scale: () => get().scale,
            rotation: () => get().rotation,
            rotationX: () => get().rotationX,
          });

          gsap.set(doc, { transformOrigin: "0 0", transformPerspective: 2200, ...overview(false) });

          /* ---------- Anotações: uma timeline em tempo real por parada ---------- */
          const noteTls = notes.map((note) => {
            const items = note.querySelectorAll("[data-note-item]");
            gsap.set(note, { autoAlpha: 0 });
            gsap.set(items, { autoAlpha: 0, y: 26 });
            return gsap
              .timeline({ paused: true })
              .set(note, { autoAlpha: 1 })
              .to(items, { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE_IN, stagger: STAGGER });
          });

          const markTls = marks.map((m) =>
            gsap.fromTo(
              m,
              { backgroundSize: "0% 100%" },
              { backgroundSize: "100% 100%", duration: 0.9, ease: EASE_IN, paused: true },
            ),
          );

          gsap.set(q("[data-outro-item]"), { autoAlpha: 0, y: 26 });
          const outroTl = gsap
            .timeline({ paused: true })
            .to(q("[data-outro-item]"), { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE_IN, stagger: STAGGER });

          /* ---------- Intro: título entra quando a seção chega ---------- */
          gsap.set(q("[data-intro-item]"), { autoAlpha: 0, y: 26 });
          gsap.to(q("[data-intro-item]"), {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: EASE_IN,
            stagger: STAGGER,
            scrollTrigger: { trigger: section, start: "top 65%", toggleActions: "play none none reverse" },
          });

          /* ---------- Câmera ---------- */
          const holds: { start: number; end: number }[] = [];
          const counter = q("[data-counter]")[0];
          const ticks = q("[data-tick]");
          gsap.set(ticks, { scaleX: 0 });
          let active = -1; // anotação visível (-1 = nenhuma, STOPS.length = fecho)
          let reached = -1;
          const markOn = marks.map(() => false);

          const setActive = (next: number) => {
            if (next === active) return;
            const prev = active;
            active = next;
            if (prev >= 0 && prev < noteTls.length) noteTls[prev].timeScale(2.2).reverse();
            if (next >= 0 && next < noteTls.length) noteTls[next].timeScale(1).play();
            if (next === STOPS.length) outroTl.timeScale(1).play();
            else outroTl.timeScale(2).reverse();
          };

          // Contador e réguas: quantas cláusulas a câmera já leu.
          const setReached = (n: number) => {
            if (n === reached) return;
            reached = n;
            if (counter) counter.textContent = String(n);
            ticks.forEach((t, i) =>
              gsap.to(t, { scaleX: i < n ? 1 : 0, duration: 0.5, ease: EASE_IN, overwrite: true }),
            );
          };

          const camera = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            onUpdate() {
              const t = camera.time();
              // Marcações ficam depois que a câmera passou por elas.
              holds.forEach((h, i) => {
                const want = t >= h.start;
                if (want !== markOn[i]) {
                  markOn[i] = want;
                  if (want) markTls[i].timeScale(1).play();
                  else markTls[i].timeScale(2).reverse();
                }
              });
              let next = -1;
              holds.forEach((h, i) => {
                if (t >= h.start - 0.05 && t < h.end) next = i;
              });
              if (t >= camera.duration() - T_END_HOLD - 0.25) next = STOPS.length;
              setActive(next);
              setReached(holds.filter((h) => t >= h.start - 0.05).length);
            },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              // Comprimento do pin baseado na altura do palco (100svh), que é
              // estável no celular — innerHeight muda com a barra de endereço.
              // No desktop svh === innerHeight, então nada muda lá.
              end: () => "+=" + stage.clientHeight * (desktop ? 6 : 5.2),
              pin: true,
              // Inércia: a câmera "alcança" o scroll, em vez de grudar nele.
              scrub: 1.1,
              invalidateOnRefresh: true,
              // Sem anticipatePin: ele prevê o pin pela velocidade do scroll
              // nativo, mas aqui quem chama ScrollTrigger.update é o Lenis.
              // Em flicks no touch, a previsão errava e o palco saltava ~110px.
            },
          });

          // Intro: contrato na mesa; o título sai de quadro quando a câmera mergulha.
          camera.to({}, { duration: T_INTRO });
          camera.to(
            q("[data-intro]"),
            { autoAlpha: 0, x: desktop ? -60 : 0, y: desktop ? 0 : -40, duration: T_TRAVEL * 0.6, ease: "power2.in" },
            T_INTRO,
          );

          STOPS.forEach((_, i) => {
            camera.to(doc, { ...poseTween(() => framing(i)), duration: T_TRAVEL }, i === 0 ? T_INTRO : ">");
            const start = camera.duration();
            // Durante a parada, um leve "drift" — a câmera nunca fica totalmente morta.
            camera.to(
              doc,
              {
                x: () => framing(i).x - (desktop ? 18 : 8),
                y: () => framing(i).y - 6,
                duration: T_HOLD,
                ease: "none",
              },
              ">",
            );
            holds.push({ start, end: camera.duration() });
          });

          // Recuo: o contrato inteiro, plano, com tudo marcado.
          camera.to(doc, { ...poseTween(() => overview(true)), duration: T_OUTRO, ease: "power3.inOut" });
          camera.to({}, { duration: T_END_HOLD });

          // Vinheta sutil durante o mergulho: profundidade de campo "barata".
          camera.fromTo(
            q("[data-vignette]"),
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: T_TRAVEL, ease: "power1.out" },
            T_INTRO,
          );
          camera.to(
            q("[data-vignette]"),
            { autoAlpha: 0, duration: T_OUTRO, ease: "power1.in" },
            camera.duration() - T_OUTRO - T_END_HOLD,
          );

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
      className="group/leitura relative bg-paper-2 text-ink"
    >
      <div
        data-stage
        className="relative w-full overflow-hidden group-data-[mode=camera]/leitura:h-svh"
      >
        {/* ---------- Cabeçalho de documento (continuidade do hero) ---------- */}
        <div className="pointer-events-none relative z-20 bg-paper-2"><div className="mx-auto max-w-[1680px] px-4 pb-px pt-5 font-mono text-[11px] leading-none text-ink-soft sm:px-8 sm:text-xs lg:px-12">
          <div className="flex items-baseline justify-between gap-4">
            <span>Leitura guiada</span>
            <span className="flex items-center gap-3">
              <span className="hidden gap-1 sm:group-data-[mode=camera]/leitura:flex" aria-hidden>
                {STOPS.map((s) => (
                  <span key={s.n} className="relative block h-px w-6 bg-ink/20">
                    <span data-tick className="absolute inset-0 origin-left bg-ink" />
                  </span>
                ))}
              </span>
              <span className="hidden group-data-[mode=camera]/leitura:inline">
                cláusula <span data-counter>0</span>/{STOPS.length}
              </span>
            </span>
            <span>fl. 02</span>
          </div>
          <div className="mt-3 h-px w-full bg-ink" />
        </div></div>

        {/* ---------- Intro ---------- */}
        <div
          data-intro
          className="relative z-10 mx-auto max-w-[1680px] px-4 pt-14 sm:px-8 lg:px-12 group-data-[mode=camera]/leitura:pointer-events-none group-data-[mode=camera]/leitura:absolute group-data-[mode=camera]/leitura:inset-x-0 group-data-[mode=camera]/leitura:top-0 lg:group-data-[mode=camera]/leitura:top-1/2 lg:group-data-[mode=camera]/leitura:-translate-y-1/2 lg:group-data-[mode=camera]/leitura:pt-0"
        >
          <div className="max-w-[min(40rem,46%)] max-lg:max-w-none">
            <p data-intro-item data-gsap-pending className="font-mono text-xs text-ink-soft sm:text-sm">
              Um contrato de consórcio comum. Onze cláusulas.
            </p>
            <h2
              id="leitura-titulo"
              data-intro-item
              data-gsap-pending
              className="font-display mt-4 text-[clamp(2.6rem,11vw,4rem)] leading-[0.88] lg:text-[clamp(3.5rem,6.2vw,7.5rem)]"
            >
              Quatro delas pesam no seu bolso.
            </h2>
            <p data-intro-item data-gsap-pending className="mt-5 max-w-[38ch] text-base leading-snug text-ink-soft lg:text-lg">
              Role devagar. A gente vai lendo junto com você.
            </p>
          </div>
        </div>

        {/* ---------- O contrato (o que a câmera filma) ---------- */}
        <div
          aria-hidden
          className="hidden group-data-[mode=camera]/leitura:absolute group-data-[mode=camera]/leitura:inset-0 group-data-[mode=camera]/leitura:block"
        >
          <article
            data-doc
            className="absolute left-0 top-0 w-[500px] bg-paper px-[36px] pb-[60px] pt-[48px] text-[15px] lg:w-[880px] lg:px-[72px] lg:pb-[80px] lg:pt-[64px] leading-[1.62] shadow-[0_1px_0_rgba(0,0,0,0.04),0_30px_60px_-20px_rgba(18,18,17,0.28),0_60px_120px_-40px_rgba(18,18,17,0.25)] will-change-transform"
          >
            <header className="border-b border-ink pb-5 text-center">
              <p className="font-mono text-[11px] text-ink-soft">Instrumento particular · via do consorciado</p>
              <p className="mt-2 text-[19px] font-bold uppercase tracking-[0.04em] [font-stretch:80%]">
                Contrato de adesão a grupo de consórcio
              </p>
            </header>
            <div className="mt-6 space-y-[14px] text-justify hyphens-auto">
              {CLAUSES.map((c) => (
                <div key={c.n} data-stop={c.stop ? "" : undefined} className="py-1">
                  <p className="font-mono text-[11px] font-medium uppercase">
                    Cláusula {c.n}ª — {c.heading}
                  </p>
                  <p className="mt-1">
                    {c.before}
                    {c.mark && (
                      <span
                        data-mark
                        className="bg-[linear-gradient(transparent_52%,var(--color-marker)_52%,var(--color-marker)_94%,transparent_94%)] bg-no-repeat [background-size:0%_100%]"
                      >
                        {c.mark}
                      </span>
                    )}
                    {c.after}
                  </p>
                </div>
              ))}
            </div>
            <footer className="mt-14 grid grid-cols-2 gap-12 font-mono text-[11px] text-ink-soft">
              <div>
                <div className="h-px bg-ink" />
                <p className="mt-2">CONSORCIADO</p>
              </div>
              <div>
                <div className="h-px bg-ink" />
                <p className="mt-2">ADMINISTRADORA</p>
              </div>
            </footer>
          </article>
        </div>

        {/* Vinheta de profundidade */}
        <div
          data-vignette
          aria-hidden
          className="pointer-events-none invisible absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_40%_50%,transparent_45%,rgba(18,18,17,0.18)_100%)]"
        />

        {/* ---------- Anotações de margem ---------- */}
        <ol
          className="relative z-10 mx-auto grid max-w-[1680px] gap-x-10 gap-y-12 px-4 py-14 sm:grid-cols-2 sm:px-8 lg:px-12 group-data-[mode=camera]/leitura:pointer-events-none group-data-[mode=camera]/leitura:absolute group-data-[mode=camera]/leitura:inset-0 group-data-[mode=camera]/leitura:block group-data-[mode=camera]/leitura:p-0"
        >
          {STOPS.map((c, i) => (
            <li
              key={c.n}
              data-note
              className="group-data-[mode=camera]/leitura:invisible group-data-[mode=camera]/leitura:absolute group-data-[mode=camera]/leitura:inset-x-0 group-data-[mode=camera]/leitura:bottom-0 group-data-[mode=camera]/leitura:bg-paper group-data-[mode=camera]/leitura:px-4 group-data-[mode=camera]/leitura:pb-7 group-data-[mode=camera]/leitura:pt-5 group-data-[mode=camera]/leitura:shadow-[0_-20px_40px_-10px_rgba(18,18,17,0.12)] lg:group-data-[mode=camera]/leitura:inset-x-auto lg:group-data-[mode=camera]/leitura:bottom-auto lg:group-data-[mode=camera]/leitura:right-12 lg:group-data-[mode=camera]/leitura:top-1/2 lg:group-data-[mode=camera]/leitura:w-[min(30vw,26rem)] lg:group-data-[mode=camera]/leitura:-translate-y-1/2 lg:group-data-[mode=camera]/leitura:bg-transparent lg:group-data-[mode=camera]/leitura:p-0 lg:group-data-[mode=camera]/leitura:shadow-none"
            >
              <div data-note-item className="flex items-baseline gap-3 font-mono text-xs text-ink-soft">
                <span className="tabular-nums text-ink">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-px flex-1 bg-ink/25" />
                <span>Cláusula {c.n}ª</span>
              </div>
              <h3
                data-note-item
                className="font-display mt-3 text-[2.1rem] leading-[0.92] lg:mt-5 lg:text-[clamp(2.4rem,3.4vw,3.6rem)]"
              >
                {c.stop!.title}
              </h3>
              <blockquote
                data-note-item
                className="mt-3 border-l-2 border-marker pl-3 text-sm italic leading-snug text-ink-soft lg:mt-5 lg:text-[15px]"
              >
                “{c.mark}”
              </blockquote>
              <p data-note-item className="mt-3 text-base leading-snug lg:mt-5 lg:text-lg">
                {c.stop!.body}
              </p>
              <p data-note-item className="mt-3 font-mono text-[11px] text-ink-soft lg:mt-5 lg:text-xs">
                ↳ {c.stop!.ref}
              </p>
            </li>
          ))}
        </ol>

        {/* ---------- Fecho (após o recuo da câmera) ---------- */}
        <div
          data-outro
          className="hidden group-data-[mode=camera]/leitura:pointer-events-none group-data-[mode=camera]/leitura:absolute group-data-[mode=camera]/leitura:inset-x-0 group-data-[mode=camera]/leitura:top-[5.5rem] group-data-[mode=camera]/leitura:z-10 group-data-[mode=camera]/leitura:block lg:group-data-[mode=camera]/leitura:top-1/2 lg:group-data-[mode=camera]/leitura:-translate-y-1/2"
        >
          <div className="mx-auto max-w-[1680px] px-4 sm:px-8 lg:px-12">
            <div className="lg:max-w-[46%]">
              <p data-outro-item className="font-mono text-xs text-ink-soft sm:text-sm">
                Quatro marcações em um contrato padrão.
              </p>
              <p
                data-outro-item
                className="font-display mt-4 text-[clamp(2.6rem,11vw,4rem)] leading-[0.88] lg:text-[clamp(3.5rem,6.2vw,7.5rem)]"
              >
                Quantas estão <span className="whitespace-nowrap bg-[linear-gradient(transparent_55%,var(--color-marker)_55%)]">no seu?</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
