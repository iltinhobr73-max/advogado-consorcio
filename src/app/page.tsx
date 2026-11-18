import { Hero } from "@/components/hero/Hero";
import { LeituraGuiada } from "@/components/leitura/LeituraGuiada";
import { Encaminhamento } from "@/components/encaminhamento/Encaminhamento";

export default function Home() {
  return (
    <main>
      <Hero />
      <LeituraGuiada />
      <Encaminhamento />
    </main>
  );
}
