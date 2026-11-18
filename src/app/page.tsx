import { Hero } from "@/components/hero/Hero";

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Placeholder temporário: dá altura para testar o scroll até os próximos prompts. */}
      <section id="contato" className="grid min-h-svh place-items-center border-t border-bone/10">
        <p className="text-sm uppercase tracking-[0.3em] text-bone-dim">Próximas seções</p>
      </section>
    </main>
  );
}
