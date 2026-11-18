import { Hero } from "@/components/hero/Hero";
import { LeituraGuiada } from "@/components/leitura/LeituraGuiada";
import { Pedidos } from "@/components/pedidos/Pedidos";
import { Qualificacao } from "@/components/qualificacao/Qualificacao";
import { Declaracoes } from "@/components/declaracoes/Declaracoes";
import { Quesitos } from "@/components/quesitos/Quesitos";
import { Encaminhamento } from "@/components/encaminhamento/Encaminhamento";
import { Indice } from "@/components/indice/Indice";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <LeituraGuiada />
        <Pedidos />
        <Qualificacao />
        <Declaracoes />
        <Quesitos />
        <Encaminhamento />
      </main>
      {/* Depois das seções: precisa que o pin da Leitura guiada já exista. */}
      <Indice />
    </>
  );
}
