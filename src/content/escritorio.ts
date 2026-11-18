/**
 * Dados do escritório — fonte única para o site inteiro.
 *
 * ATENÇÃO: preenchido como PROPOSTA, com os dados públicos do site atual do
 * escritório. Publicar somente pelo escritório ou com autorização dele, e
 * revisar textos/depoimentos antes (Provimento nº 205/2021 da OAB).
 */

export const ESCRITORIO = {
  nome: "Luiz Gabriel de Andrade Advogados",
  sigla: "LGA Advogados",
  advogado: "Luiz Gabriel de Andrade",
  oabs: ["OAB/DF 48.163", "OAB/SP 524.468"],
  email: "atendimentolgaadvogados@gmail.com",
  whatsapp: { exibicao: "(61) 99401-1307", e164: "5561994011307" },
  horario: "Segunda a sexta, das 9h às 18h",
  endereco: {
    linha1: "SRTVS, Ed. Assis Chateaubriand, bloco 2, salas 221 e 223",
    linha2: "Asa Sul, Brasília/DF · CEP 70340-906",
  },
  cidade: "Brasília/DF",
  /** Foto do advogado: coloque o arquivo em public/media/advogado.jpg e troque para true. */
  temFoto: false,
} as const;

export const WHATSAPP_URL = `https://wa.me/${ESCRITORIO.whatsapp.e164}?text=${encodeURIComponent(
  "Olá! Vim pelo site e gostaria de uma análise do meu contrato de consórcio.",
)}`;

/** fl. 03 — os serviços, escritos como os pedidos de uma petição. */
export const PEDIDOS = [
  {
    letra: "a",
    titulo: "Restituição de valores",
    texto:
      "Análise do que foi pago e do que pode ser devolvido em contratos com cobranças indevidas, desistência ou exclusão do grupo.",
  },
  {
    letra: "b",
    titulo: "Revisão de cláusulas abusivas",
    texto:
      "Taxa de administração fora do padrão, multa por desistência sem prejuízo comprovado, retenção do fundo de reserva — pela via do acordo ou, se preciso, judicial.",
  },
  {
    letra: "c",
    titulo: "Golpes e falsas promessas",
    texto:
      "Para quem comprou a cota com promessa de contemplação rápida ou com data certa: reunir as provas da venda e buscar a rescisão e a reparação.",
  },
] as const;

/** fl. 03 — como o atendimento funciona (sem promessa de resultado). */
export const MODO = [
  {
    titulo: "Atuação específica",
    texto: "Direito do Consumidor com foco em consórcios: é o contrato que lemos todos os dias.",
  },
  {
    titulo: "Tudo à distância",
    texto: "Consulta online e contrato assinado digitalmente. Você não precisa ir ao escritório.",
  },
  {
    titulo: "Resposta por escrito",
    texto: "Você recebe a análise do seu caso por escrito, com o que pode e o que não pode ser contestado.",
  },
  {
    titulo: "Andamento à vista",
    texto: "Você é informado de cada etapa do processo, do protocolo à decisão.",
  },
] as const;

/** fl. 04 — formação e atuação. */
export const QUALIFICACAO = {
  formacao: "Instituto Brasiliense de Direito Público (IDP)",
  cargo: "sócio fundador do escritório Luiz Gabriel de Andrade Advogados Associados",
  temas: [
    "promessas de contemplação",
    "fraudes e golpes na venda de cotas",
    "contratos abusivos",
    "restituição de valores",
  ],
};

/** fl. 05 — avaliações públicas no Google (manter só com autorização do escritório). */
export const DECLARACOES = [
  {
    texto: "Dr. Luiz é um advogado de profundo conhecimento e profissionalismo. Recomendo e confio!",
    nome: "Adele Adriano",
    data: "16/09/2024",
  },
  {
    texto: "Excelente, super disponível às demandas e muito profissional!",
    nome: "Samuel Cavalcante Xavier",
    data: "16/09/2024",
  },
  {
    texto: "Ótimo advogado, me instruiu do início ao fim. Nota 10 para ele, muito educado e gentil.",
    nome: "Elton Morais",
    data: "26/08/2024",
  },
  {
    texto: "Extremamente profissional e conseguiu entrar num consenso de ambas as partes. Super recomendo!",
    nome: "Lukas Shantana",
    data: "26/08/2024",
  },
] as const;

/** fl. 06 — perguntas frequentes. */
export const QUESITOS = [
  {
    pergunta: "Posso recuperar o valor que já paguei no consórcio?",
    resposta:
      "Em muitos casos, sim. Quem desiste ou é excluído do grupo tem direito à restituição do que pagou ao fundo comum, e cobranças indevidas podem ser devolvidas. O valor e o momento dependem do contrato e da situação — por isso cada caso é analisado individualmente.",
  },
  {
    pergunta: "Taxa de administração muito alta é legal?",
    resposta:
      "A administradora pode cobrar a taxa, mas ela deve estar clara no contrato e dentro do que se pratica no mercado. Quando é excessiva ou foi cobrada de forma escondida (por exemplo, embutida na primeira parcela sem explicação), pode ser questionada.",
  },
  {
    pergunta: "Me prometeram contemplação rápida e não aconteceu. O que fazer?",
    resposta:
      "Contemplação só acontece por sorteio ou lance; ninguém pode garantir data. Se o vendedor prometeu, essa promessa faz parte da oferta. Guarde conversas, áudios, anúncios e o contrato: com essas provas é possível buscar a rescisão com devolução e a reparação dos danos.",
  },
  {
    pergunta: "O que é uma cláusula abusiva num contrato de consórcio?",
    resposta:
      "É a que coloca o consumidor em desvantagem exagerada: multas desproporcionais, taxas ocultas, retenção indevida do fundo de reserva ou condições que contrariam o Código de Defesa do Consumidor. Cláusulas assim podem ser anuladas.",
  },
  {
    pergunta: "Preciso ir ao escritório?",
    resposta:
      "Não. O atendimento pode ser todo online: você envia o contrato, conversamos por WhatsApp ou videochamada e, se decidir seguir, o contrato de honorários é assinado digitalmente.",
  },
] as const;

/** Faixas de valor pago (qualifica o contato, como no site original). */
export const FAIXAS_VALOR = [
  { value: "ate-10", label: "Até R$ 10 mil" },
  { value: "10-20", label: "De R$ 10 mil a R$ 20 mil" },
  { value: "21-40", label: "De R$ 21 mil a R$ 40 mil" },
  { value: "41-60", label: "De R$ 41 mil a R$ 60 mil" },
  { value: "60+", label: "Mais de R$ 60 mil" },
] as const;

/** Sumário: as folhas do documento. */
export const SUMARIO = [
  { fl: "01", titulo: "Apresentação", href: "#top" },
  { fl: "02", titulo: "Leitura guiada", href: "#leitura" },
  { fl: "03", titulo: "Dos pedidos", href: "#pedidos" },
  { fl: "04", titulo: "Qualificação", href: "#qualificacao" },
  { fl: "05", titulo: "Declarações", href: "#declaracoes" },
  { fl: "06", titulo: "Quesitos", href: "#quesitos" },
  { fl: "07", titulo: "Encaminhamento", href: "#contato" },
] as const;
