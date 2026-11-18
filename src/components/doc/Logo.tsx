import { ESCRITORIO } from "@/content/escritorio";

/**
 * Monograma do escritório (LGA). A forma vem do logo original como máscara
 * (public/media/logo-monograma.png), então ele assume a cor do texto ao
 * redor: tinta no papel, papel na mesa escura.
 */
export function Monograma({ className = "h-8" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label={`${ESCRITORIO.sigla} — monograma`}
      className={`inline-block aspect-[415/477] bg-current [mask-image:url(/media/logo-monograma.png)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${className}`}
    />
  );
}

/** Monograma + nome em tipografia do site. */
export function Assinatura({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Monograma className="h-[1.9em]" />
      <span className="leading-[1.05]">
        <span className="block font-semibold [font-stretch:85%]">{ESCRITORIO.advogado}</span>
        <span className="block font-mono text-[0.78em] opacity-70">Advogados</span>
      </span>
    </span>
  );
}
