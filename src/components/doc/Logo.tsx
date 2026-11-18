import { ESCRITORIO } from "@/content/escritorio";

/**
 * Logo original do escritório (public/media/logo.jpg — 150×150, fundo azul
 * #142f40 igual ao `ink` do site). Arquivo pequeno: não exibir acima de
 * ~150px de altura. Com o arquivo vetorial (SVG), basta trocar o src.
 */
export function Logo({ className = "h-14" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/media/logo.jpg"
      alt={`${ESCRITORIO.nome} — logo`}
      width={150}
      height={150}
      className={`aspect-square w-auto ${className}`}
    />
  );
}
