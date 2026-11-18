"use client";

import { useRef, useState, type FormEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useScrollTo } from "@/components/providers/SmoothScroll";
import { ESCRITORIO, FAIXAS_VALOR, WHATSAPP_URL } from "@/content/escritorio";
import { Assinatura } from "@/components/doc/Logo";

/**
 * fl. 07 — Encaminhamento.
 * A última folha do documento: um termo para preencher. As linhas dos
 * campos são "traçadas" no papel quando a folha chega; ao enviar, um
 * carimbo de RECEBIDO marca a folha.
 */

const STAGGER = 0.2;
const EASE_IN = "power3.out";

const SITUACOES = [
  { value: "pagando", label: "Ainda estou pagando as parcelas" },
  { value: "desisti", label: "Desisti ou fui excluído do grupo" },
  { value: "contemplado", label: "Fui contemplado e tive problema" },
  { value: "promessa", label: "Me prometeram contemplação rápida" },
];

type Status = "idle" | "sending" | "ok" | "not_configured" | "invalid" | "error";

const MESSAGES: Record<Exclude<Status, "idle" | "sending" | "ok">, string> = {
  not_configured:
    "O envio ainda não está ativo neste site. Seus dados não foram enviados.",
  invalid: "Confira os campos marcados: algum dado está incompleto ou o arquivo é grande demais (máx. 10 MB).",
  error: "Não conseguimos enviar agora. Tente de novo em alguns minutos.",
};

function maskWhatsapp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function Encaminhamento() {
  const root = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();
  const [status, setStatus] = useState<Status>("idle");
  const [whats, setWhats] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  // Data do carimbo: definida no momento do envio (não no render/pré-render).
  const [hoje, setHoje] = useState("");

  const { contextSafe } = useGSAP(
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
          gsap.set(q("[data-gsap-pending]"), { autoAlpha: 1 });
          gsap.set(q("[data-stamp]"), { autoAlpha: 0, rotation: -8 });
          if (reduce) return;

          gsap.set(q("[data-enc-rule]"), { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.set(q("[data-enc-item]"), { autoAlpha: 0, y: 26 });
          gsap.set(q("[data-line]"), { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.set(q("[data-sheet]"), { autoAlpha: 0, y: 40 });

          gsap
            .timeline({
              scrollTrigger: {
                trigger: root.current,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            })
            .to(q("[data-enc-rule]"), { scaleX: 1, duration: 1.2, ease: "expo.inOut" }, 0)
            .to(q("[data-enc-item]"), { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE_IN, stagger: STAGGER }, 0.3)
            .to(q("[data-sheet]"), { autoAlpha: 1, y: 0, duration: 1.0, ease: EASE_IN }, 0.6)
            // As linhas dos campos são traçadas no papel, uma após a outra.
            .to(q("[data-line]"), { scaleX: 1, duration: 0.9, ease: "expo.out", stagger: STAGGER }, 1.1);

          // Linhas de assinatura: traçadas quando o rodapé chega.
          gsap.set(q("[data-sig-line]"), { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.to(q("[data-sig-line]"), {
            scaleX: 1,
            duration: 1.2,
            ease: "expo.inOut",
            stagger: STAGGER,
            scrollTrigger: { trigger: q("footer")[0], start: "top 90%", toggleActions: "play none none reverse" },
          });
        },
      );
    },
    { scope: root },
  );

  const showStamp = contextSafe((stamp: Element) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(stamp, { autoAlpha: 1, scale: 1, rotation: -8 });
      return;
    }
    gsap.fromTo(
      stamp,
      { autoAlpha: 0, scale: 1.7, rotation: -16 },
      { autoAlpha: 1, scale: 1, rotation: -8, duration: 0.7, ease: "power3.out" },
    );
  });

  const showMessage = contextSafe((msg: Element) => {
    gsap.fromTo(msg, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE_IN });
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending" || status === "ok") return;
    setStatus("sending");
    let next: Status = "error";
    try {
      const res = await fetch("/api/contato", { method: "POST", body: new FormData(e.currentTarget) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (json.ok) next = "ok";
      else if (json.error === "not_configured") next = "not_configured";
      else if (json.error === "invalid") next = "invalid";
    } catch {
      next = "error";
    }
    if (next === "ok") {
      setHoje(new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }));
    }
    setStatus(next);
    // Espera o React pintar o estado novo antes de animar.
    const el = root.current;
    requestAnimationFrame(() => {
      const target = el?.querySelector(next === "ok" ? "[data-stamp]" : "[data-status]");
      if (target) (next === "ok" ? showStamp : showMessage)(target);
    });
  }

  const sent = status === "ok";

  return (
    <section
      ref={root}
      id="contato"
      aria-labelledby="contato-titulo"
      className="relative bg-paper text-ink"
    >
      <div className="mx-auto max-w-[1680px] px-4 pb-10 pt-5 sm:px-8 lg:px-12">
        {/* ---------- Cabeçalho de documento ---------- */}
        <div className="font-mono text-[11px] leading-none text-ink-soft sm:text-xs">
          <div className="flex items-baseline justify-between gap-4">
            <span>Encaminhamento</span>
            <span className="hidden sm:inline">Termo de envio para análise</span>
            <span>fl. 07</span>
          </div>
          <div data-enc-rule className="mt-3 h-px w-full bg-ink" />
        </div>

        <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-[1fr_minmax(0,40rem)] lg:gap-20">
          {/* ---------- Texto ---------- */}
          <div>
            <p data-enc-item data-gsap-pending className="font-mono text-xs text-ink-soft sm:text-sm">
              Última folha.
            </p>
            <h2
              id="contato-titulo"
              data-enc-item
              data-gsap-pending
              className="font-display mt-4 text-[clamp(2.8rem,12vw,4.5rem)] leading-[0.88] lg:text-[clamp(4rem,7vw,8.5rem)]"
            >
              Mande o contrato.
              <br />A gente devolve{" "}
              <span className="whitespace-nowrap bg-[linear-gradient(transparent_55%,var(--color-marker)_55%)]">
                lido.
              </span>
            </h2>

            <ol className="mt-10 max-w-[44ch] space-y-5 font-mono text-[13px] leading-[1.6] text-ink-soft sm:text-sm lg:mt-14">
              {[
                "Você envia o contrato — PDF ou fotos das páginas, como estiver.",
                "Lemos cláusula por cláusula: taxas, fundo de reserva, multa, o que foi prometido na venda.",
                "Você recebe por escrito, no WhatsApp, o que pode ser contestado no seu caso — e o que não pode.",
              ].map((t, i) => (
                <li key={i} data-enc-item data-gsap-pending className="grid grid-cols-[2.25rem_1fr]">
                  <span className="tabular-nums text-ink">{String(i + 1).padStart(2, "0")}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>

            <dl className="mt-14 max-w-[30rem] font-mono text-[12px] sm:text-[13px]">
              {[
                { k: "WhatsApp", v: ESCRITORIO.whatsapp.exibicao, href: WHATSAPP_URL },
                { k: "E-mail", v: ESCRITORIO.email, href: `mailto:${ESCRITORIO.email}` },
                { k: "Horário", v: ESCRITORIO.horario },
                { k: "Endereço", v: `${ESCRITORIO.endereco.linha1} — ${ESCRITORIO.endereco.linha2}` },
              ].map((c) => (
                <div key={c.k} data-enc-item data-gsap-pending className="grid grid-cols-[6.5rem_1fr] gap-3 border-t border-ink/15 py-3">
                  <dt className="text-ink-soft">{c.k}</dt>
                  <dd className="break-words text-ink">
                    {c.href ? (
                      <a
                        href={c.href}
                        {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="underline decoration-ink/30 underline-offset-4 hover:bg-marker hover:decoration-ink"
                      >
                        {c.v}
                      </a>
                    ) : (
                      c.v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ---------- O termo (formulário) ---------- */}
          <div data-sheet data-gsap-pending className="relative">
            <form
              action="/api/contato"
              method="post"
              encType="multipart/form-data"
              onSubmit={onSubmit}
              aria-describedby="contato-status"
              className="relative bg-paper-2/60 px-5 pb-8 pt-7 shadow-[0_1px_0_rgba(0,0,0,0.04),0_30px_60px_-30px_rgba(18,18,17,0.3)] sm:px-9 sm:pb-10 sm:pt-9"
            >
              <p className="text-center text-[15px] font-bold uppercase tracking-[0.04em] [font-stretch:80%]">
                Termo de encaminhamento
              </p>
              <p className="mt-1 text-center font-mono text-[11px] text-ink-soft">
                Preencha os campos. Só o essencial.
              </p>

              <fieldset disabled={sent} className="mt-8 space-y-7">
                <Field label="Nome do consorciado" name="nome" autoComplete="name" required minLength={2} maxLength={120} />
                <Field
                  label="WhatsApp"
                  name="whatsapp"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="(00) 00000-0000"
                  required
                  value={whats}
                  onChange={(v) => setWhats(maskWhatsapp(v))}
                  pattern="\(\d{2}\) \d{4,5}-\d{4}"
                  title="DDD + número, ex.: (61) 99999-0000"
                />
                <Field label="Administradora" name="administradora" placeholder="opcional" maxLength={120} />

                <label className="block">
                  <span className="font-mono text-[11px] text-ink-soft">Quanto já pagou no consórcio</span>
                  <select
                    name="valor"
                    required
                    defaultValue=""
                    className="mt-1 block w-full cursor-pointer appearance-none bg-transparent py-1.5 text-[17px] text-ink outline-none invalid:text-ink-faint/70"
                  >
                    <option value="" disabled>
                      Selecione uma faixa
                    </option>
                    {FAIXAS_VALOR.map((f) => (
                      <option key={f.value} value={f.value} className="text-ink">
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <span data-line className="block h-px w-full bg-ink/40" />
                </label>

                <div>
                  <p className="font-mono text-[11px] text-ink-soft">Situação do consórcio</p>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {SITUACOES.map((s, i) => (
                      <label key={s.value} className="group flex cursor-pointer items-start gap-3 text-[15px] leading-snug">
                        <input
                          type="radio"
                          name="situacao"
                          value={s.value}
                          required={i === 0}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden
                          className="mt-[3px] grid size-[15px] shrink-0 place-items-center border border-ink font-mono text-[12px] leading-none text-transparent peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
                        >
                          ×
                        </span>
                        <span>{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[11px] text-ink-soft">Anexo I — contrato</p>
                  <label className="mt-3 flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2">
                    <input
                      type="file"
                      name="contrato"
                      multiple
                      accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif"
                      className="peer sr-only"
                      onChange={(e) => setFiles(Array.from(e.currentTarget.files ?? []).map((f) => f.name))}
                    />
                    <span className="border border-ink px-3 py-2 font-mono text-xs peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink hover:bg-ink hover:text-paper">
                      Selecionar arquivos
                    </span>
                    <span className="font-mono text-[11px] text-ink-soft">
                      {files.length ? files.join(", ") : "PDF ou fotos · até 10 MB cada · opcional"}
                    </span>
                  </label>
                  <span data-line className="mt-3 block h-px w-full bg-ink/40" />
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-ink-soft">
                  <input type="checkbox" name="consentimento" required className="peer sr-only" />
                  <span
                    aria-hidden
                    className="mt-[2px] grid size-[15px] shrink-0 place-items-center border border-ink font-mono text-[12px] leading-none text-transparent peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
                  >
                    ×
                  </span>
                  <span>
                    Autorizo o uso destes dados e arquivos apenas para a análise do meu caso e o contato sobre ele (LGPD).
                  </span>
                </label>
              </fieldset>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={status === "sending" || sent}
                  className="group flex items-stretch bg-ink text-paper outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink disabled:cursor-default"
                >
                  <span className="flex flex-1 items-center px-5 py-3.5 text-[15px] font-semibold [font-stretch:88%] sm:px-6">
                    {status === "sending" ? "Enviando…" : sent ? "Enviado" : "Enviar para análise"}
                  </span>
                  <span className="grid w-14 place-items-center border-l border-paper/15 transition-colors group-hover:bg-marker group-hover:text-ink">
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
                      <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </span>
                </button>
                <p className="font-mono text-[11px] text-ink-soft">O retorno é feito pelo WhatsApp informado.</p>
              </div>

              <p
                id="contato-status"
                data-status
                role="status"
                aria-live="polite"
                className={
                  "mt-5 font-mono text-xs leading-relaxed " +
                  (status === "idle" || status === "sending" || sent ? "sr-only" : "invisible")
                }
              >
                {sent
                  ? "Recebido. Vamos ler o seu contrato e responder pelo WhatsApp."
                  : status !== "idle" && status !== "sending"
                    ? (
                      <span className="bg-[linear-gradient(transparent_55%,var(--color-marker)_55%)]">
                        {MESSAGES[status]}
                      </span>
                    )
                    : null}
              </p>

              {/* Carimbo */}
              <div
                data-stamp
                aria-hidden
                className="pointer-events-none invisible absolute right-6 top-24 border-[3px] border-double border-ink px-4 py-2 text-center font-mono text-ink mix-blend-multiply sm:right-10"
              >
                <span className="block text-2xl font-medium tracking-[0.2em]">RECEBIDO</span>
                <span className="block text-[11px]">{hoje}</span>
              </div>
            </form>
          </div>
        </div>

        {/* ---------- Fecho do documento ---------- */}
        <footer className="mt-24 lg:mt-32">
          <div className="grid gap-10 font-mono text-[11px] text-ink-soft sm:grid-cols-2 sm:gap-16">
            <div>
              <span data-sig-line className="block h-px w-full bg-ink" />
              <p className="mt-2">{ESCRITORIO.cidade}, data</p>
            </div>
            <div>
              <span data-sig-line className="block h-px w-full bg-ink" />
              <p className="mt-2">
                {ESCRITORIO.advogado} · {ESCRITORIO.oabs.join(" · ")}
              </p>
            </div>
          </div>

          <div className="mt-16">
            <Assinatura className="text-[17px] text-ink" />
          </div>
          <div className="mt-6 flex flex-col gap-6 border-t border-ink/15 pt-5 font-mono text-[11px] leading-relaxed text-ink-faint sm:flex-row sm:items-start sm:justify-between">
            <p className="max-w-[70ch]">
              © {ESCRITORIO.nome}. Conteúdo de caráter informativo. Não há promessa de resultado: cada contrato é analisado
              individualmente. O contrato exibido nesta página é fictício. Publicidade conforme o
              Provimento nº 205/2021 do Conselho Federal da OAB.
            </p>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollTo(0);
              }}
              className="shrink-0 text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            >
              ↑ voltar à fl. 01
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  inputMode?: "numeric" | "text";
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  title?: string;
  value?: string;
  onChange?: (v: string) => void;
};

/** Campo "preencha aqui": rótulo de contrato + linha traçada pelo GSAP. */
function Field({ label, onChange, value, ...input }: FieldProps) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] text-ink-soft">{label}</span>
      <input
        {...input}
        {...(onChange ? { value, onChange: (e) => onChange(e.currentTarget.value) } : {})}
        className="mt-1 block w-full bg-transparent py-1.5 text-[17px] text-ink outline-none placeholder:text-ink-faint/70"
      />
      <span data-line className="block h-px w-full bg-ink/40" />
    </label>
  );
}
