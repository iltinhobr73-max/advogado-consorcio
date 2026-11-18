import { Hero } from "@/components/hero/Hero";
import { LeituraGuiada } from "@/components/leitura/LeituraGuiada";

export default function Home() {
  return (
    <main>
      <Hero />
      <LeituraGuiada />

      {/* Placeholder temporário: dá altura para testar o scroll até os próximos prompts. */}
      <section id="contato" className="grid min-h-svh place-items-center border-t border-ink/15">
        <p className="text-sm uppercase tracking-[0.3em] font-mono text-ink-faint">Próximas seções</p>
      </section>
    </main>
  );
}
