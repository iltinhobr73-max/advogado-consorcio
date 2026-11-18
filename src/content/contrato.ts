/**
 * Contrato de consórcio fictício usado na seção "Leitura guiada".
 * Cláusulas com `stop` são as paradas da câmera; `mark` é o trecho que
 * recebe o marca-texto e `note` é a anotação de margem.
 */

export type ClauseNote = {
  title: string;
  body: string;
  ref: string;
};

export type Clause = {
  n: number;
  heading: string;
  /** Texto antes do trecho marcado. */
  before: string;
  /** Trecho marcado (só nas paradas). */
  mark?: string;
  /** Texto depois do trecho marcado. */
  after?: string;
  stop?: ClauseNote;
};

export const CLAUSES: Clause[] = [
  {
    n: 1,
    heading: "Do objeto",
    before:
      "O presente instrumento tem por objeto a adesão do CONSORCIADO a grupo de consórcio administrado pela ADMINISTRADORA, destinado à aquisição de bem móvel ou imóvel mediante autofinanciamento, nos termos da Lei nº 11.795/2008.",
  },
  {
    n: 2,
    heading: "Do grupo e da cota",
    before:
      "O grupo é constituído por número determinado de participantes, cabendo a cada um cota identificada por número próprio, vedada a cessão sem prévia anuência da ADMINISTRADORA.",
  },
  {
    n: 3,
    heading: "Da taxa de administração",
    before: "A remuneração da ADMINISTRADORA corresponderá a percentual incidente sobre o valor do crédito, ",
    mark: "podendo ser cobrada antecipadamente, em parcela adicional, no ato da adesão",
    after: ", conforme tabela vigente à época da contratação.",
    stop: {
      title: "Taxa de administração",
      body: "Muitas vezes vem embutida já na primeira parcela. Percentual muito acima do praticado no mercado pode ser discutido como cláusula abusiva.",
      ref: "CDC, art. 51, IV",
    },
  },
  {
    n: 4,
    heading: "Do fundo de reserva",
    before: "Fica instituído fundo de reserva, constituído por percentual mensal sobre o valor do bem, ",
    mark: "cujos recursos não utilizados terão a destinação definida pela ADMINISTRADORA",
    after: " ao término das operações do grupo.",
    stop: {
      title: "Fundo de reserva",
      body: "Não é receita da administradora: é dinheiro do grupo. O saldo que sobra no encerramento pertence aos consorciados, não a ela.",
      ref: "Lei nº 11.795/2008",
    },
  },
  {
    n: 5,
    heading: "Da contemplação",
    before: "A contemplação dar-se-á por sorteio ou por lance, nas assembleias gerais ordinárias, ",
    mark: "não se responsabilizando a ADMINISTRADORA por informações prestadas por representantes de venda",
    after: " acerca de prazos de contemplação.",
    stop: {
      title: "Promessa de contemplação",
      body: "Contemplação só acontece por sorteio ou lance. Se o vendedor garantiu uma data, essa promessa faz parte da oferta e pode justificar a rescisão com devolução.",
      ref: "CDC, arts. 30 e 37",
    },
  },
  {
    n: 6,
    heading: "Do lance",
    before:
      "O CONSORCIADO poderá oferecer lance livre ou embutido, sendo vencedor o que representar o maior percentual sobre o valor do crédito, observados os critérios de desempate.",
  },
  {
    n: 7,
    heading: "Do seguro",
    before:
      "Poderá ser contratado seguro prestamista, cujo prêmio será cobrado juntamente com a parcela mensal, nos termos da legislação aplicável.",
  },
  {
    n: 8,
    heading: "Da exclusão",
    before:
      "Será excluído do grupo o CONSORCIADO não contemplado que deixar de pagar parcelas na forma prevista ou que manifestar sua desistência.",
  },
  {
    n: 9,
    heading: "Da multa por desistência",
    before: "Os valores do CONSORCIADO excluído serão restituídos por contemplação da cota ou ao término do grupo, ",
    mark: "deduzida multa compensatória de 20% sobre o montante a restituir",
    after: ", além da taxa de administração e demais encargos.",
    stop: {
      title: "Multa por desistência",
      body: "Multa fixa não basta: a jurisprudência exige que a administradora prove o prejuízo efetivo que a sua saída causou ao grupo.",
      ref: "Entendimento do STJ",
    },
  },
  {
    n: 10,
    heading: "Do reajuste",
    before:
      "O valor do crédito e das parcelas será atualizado conforme a variação do preço do bem de referência ou do índice indicado neste instrumento.",
  },
  {
    n: 11,
    heading: "Das disposições gerais",
    before:
      "As partes declaram ter lido e compreendido integralmente este instrumento, inclusive as cláusulas que limitam direitos, redigidas com o devido destaque.",
  },
];

export const STOPS = CLAUSES.filter((c) => c.stop);
