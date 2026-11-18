@AGENTS.md

# Projeto: site de advocacia em consórcios

Stack: Next.js (App Router, `src/`), TypeScript, Tailwind CSS v4, GSAP + ScrollTrigger, Lenis.

## Regra de animação (obrigatória)

**Toda animação usa Lenis no scroll e GSAP no movimento.**

- **Scroll = Lenis.** Existe uma única instância de Lenis para o site inteiro, criada num provider client-side no layout raiz. Nenhum componente cria a própria instância nem usa `window.scrollTo`, `scroll-behavior: smooth` em CSS ou bibliotecas de scroll alternativas. Âncoras e "voltar ao topo" usam `lenis.scrollTo(...)`.
- **Movimento = GSAP.** Todo movimento (entrada, parallax, reveal, hover elaborado, contadores, transições) é feito com GSAP. Nada de CSS `@keyframes`/`transition` para animações de conteúdo, nem Framer Motion ou outras libs de animação. (Transições triviais de cor/opacidade em hover via Tailwind são aceitáveis.)
- **Animação ligada ao scroll = ScrollTrigger**, sincronizado com Lenis:
  - `gsap.registerPlugin(ScrollTrigger)` uma vez, no provider.
  - `lenis.on('scroll', ScrollTrigger.update)`.
  - O loop do Lenis roda no ticker do GSAP: `gsap.ticker.add((t) => lenis.raf(t * 1000))` e `gsap.ticker.lagSmoothing(0)`. Não usar `requestAnimationFrame` próprio.
- **Em React, usar `useGSAP` (`@gsap/react`)** com `scope` no ref do componente, para que tweens e ScrollTriggers sejam limpos automaticamente ao desmontar. Componentes com animação são `"use client"`.
- **Acessibilidade:** respeitar `prefers-reduced-motion` — com ele ativo, Lenis fica desligado (scroll nativo) e as animações GSAP vão direto ao estado final (use `gsap.matchMedia()`).
- **Ritmo cinematográfico (obrigatório):**
  - Toda entrada ou saída dura **no mínimo 0.6s**. Nada de `duration: 0.01` para "aparecer": use fade de 0.6s+. `.set()` só para estados que o usuário não vê (ex.: texto sob uma tarja).
  - Saídas não são a entrada rebobinada com `timeScale` acelerado (isso encurta a saída abaixo de 0.6s): faça um tween de saída próprio (≥0.6s, `power3.in`) e só depois comece a próxima entrada.
  - **Eases permitidos: só `power3.*` e `expo.*`** — inclusive em tweens com scrub, loops e no `easing` do `lenis.scrollTo` (expo.out). Nunca deixar um tween sem `ease` (o padrão do GSAP é power1.out).
  - Em recolhimento de tarjas/barras (scaleX → 0), prefira `power3` a `expo`: a cauda da expo deixa um filete de poucos px parado na tela.
  - Exceção consciente: `transition-colors` de hover em botões (feedback de UI, não entrada/saída).
- O conteúdo deve ser legível e indexável sem JavaScript: o estado inicial "escondido" das animações é aplicado pelo GSAP (`gsap.set`/`from` no cliente), não por classes CSS no HTML do servidor.
  - Única exceção, contra o flash antes da hidratação: um script inline no `<head>` adiciona a classe `js` ao `<html>`, e `.js [data-gsap-pending]` fica `visibility: hidden`. Todo elemento com `data-gsap-pending` precisa receber `autoAlpha: 1` do GSAP ao montar (inclusive no ramo de reduced motion).

## Onde fica cada coisa

- `src/lib/gsap.ts` — registra os plugins (ScrollTrigger, useGSAP). Importe `gsap`, `ScrollTrigger` e `useGSAP` sempre daqui.
- `src/components/providers/SmoothScroll.tsx` — instância única do Lenis + `useScrollTo()` para rolar até âncoras.
- `src/components/hero/Hero.tsx` — hero "letras miúdas": vídeo do contrato, título tarjado que vira marca-texto, "(continua na próxima página)" como scroll indicator.
- `src/components/leitura/LeituraGuiada.tsx` — fl. 02, "a letra miúda em letra graúda": pin com travelling horizontal por 6 planos (abertura, 4 cláusulas, fecho). Câmera = timeline com scrub (x do trilho + dolly de escala + numeral gigante em outra velocidade para profundidade); conteúdo de cada plano = timeline em tempo real (stagger 0.2, power3.out) disparada na chegada. Trilho `w-[600%]` com planos `w-1/6` — mudou o nº de planos, ajuste as duas classes.
- `src/content/contrato.ts` — texto do contrato fictício e das anotações (paradas da câmera).
- `src/content/escritorio.ts` — **todos os dados do escritório** (nome, OAB, contatos, pedidos, qualificação, depoimentos, perguntas, sumário). Altere aqui, não nos componentes.
- `src/components/doc/Folha.tsx` — `FolhaHeader` (cabeçalho mono + régua) e `revealFolha()` (entrada padrão: régua expo.inOut, `[data-item]` com stagger 0.2 power3.out, `[data-draw]` linhas traçadas). Use em toda folha nova.
- Folhas: hero fl. 01 · `leitura/` fl. 02 · `pedidos/` fl. 03 · `qualificacao/` fl. 04 · `declaracoes/` fl. 05 · `quesitos/` fl. 06 · `encaminhamento/` fl. 07.
- `src/components/indice/Indice.tsx` — "Sumário" flutuante (índice com folhas, trava o scroll via `useScrollLock`) + aba de WhatsApp. Renderizado DEPOIS das seções (precisa do pin da leitura). No mobile some durante a Leitura guiada.
- `src/components/encaminhamento/Encaminhamento.tsx` — fl. 07: termo de encaminhamento (formulário), carimbo "RECEBIDO" e fecho do documento.
- `src/app/api/contato/route.ts` — recebe o formulário e repassa para `CONTACT_WEBHOOK_URL`. Sem essa variável responde 503 `not_configured` e o site avisa que o envio não está ativo (nunca finge sucesso).
- `public/media/advogado.jpg` — foto do advogado (208×337, baixa resolução: exibida pequena e em P&B). `logo-monograma.png` — monograma extraído do logo original como máscara alfa; use sempre via `<Monograma>`/`<Assinatura>` (`src/components/doc/Logo.tsx`), que herdam a cor do texto. `src/app/icon.png` gerado a partir dele.
- `public/media/contrato.mp4` / `contrato-poster.jpg` — contrato de consórcio fictício rolando em loop (gerado). Pode ser trocado por filmagem real de um contrato.

## Direção de arte

O site é um **documento**, não um template de advocacia. Evitar o padrão genérico: fundo escuro, serifa clássica, dourado, botões em pílula, microcopy em caixa alta espaçada, "role" com linha, ícones de balança/martelo, gradientes radiais.

- Paleta: papel (`paper`), tinta (`ink`) e marca-texto (`marker`). O amarelo só aparece onde algo é "destacado". Contraste alto: textos secundários em `ink-soft` (não mais claros que isso em texto corrido); amarelo vivo, usado como bloco (`bg-marker text-ink`) em títulos sobre fundo escuro.
- A Leitura guiada acontece numa **mesa escura** (`bg-ink`, luz radial): é a única folha escura, para dar ritmo à página. O trecho abusivo de cada cláusula aparece em tipografia gigante e o marca-texto o atravessa (o texto passa de papel para tinta junto).
- Tipografia: Archivo condensado e pesado (`.font-display`) para display; IBM Plex Mono para notas de margem, numeração, metadados e notas de rodapé.
- Vocabulário visual de contrato: tarjas, marca-texto, notas de rodapé (¹), numeração de linhas, "fl. 01", régua fina, cantos retos.
- Cada seção deve ter uma ideia ligada ao assunto (consórcio/contrato), não só um layout.
- Cabeçalho de documento em cada seção (mono, régua fina) com numeração de folha contínua (fl. 01 a fl. 07). Ao inserir uma folha, renumere as seguintes e o `SUMARIO`.
- Cada seção traduz um bloco comum de site de advocacia para o vocabulário jurídico: serviços = pedidos (a, b, c), diferenciais = incisos (I–IV), sobre = qualificação, depoimentos = declarações assinadas, FAQ = quesitos, contato = termo de encaminhamento.

## Armadilhas conhecidas

- Tailwind só gera classes escritas por extenso no código: nunca monte `group-data-[...]:classe` com template string/variável.
- Tailwind v4: `scale-*`, `rotate-*` e `translate-*` usam as propriedades CSS `scale`/`rotate`/`translate`, que se SOMAM ao `transform` do GSAP. Em elemento animado pelo GSAP, não usar essas classes — defina o estado inicial com `gsap.set`.
- GSAP não interpola `var(--cor)`: use o valor hex.
- **Pin + Lenis: nunca usar `anticipatePin`.** Ele prevê o pin pela velocidade do scroll nativo, mas aqui o `ScrollTrigger.update` vem do Lenis; em flicks no celular o palco saltava ~110px.
- **Comprimento de pin/scrub em altura estável**: use a altura de um elemento `h-svh` (ex.: `stage.clientHeight`), nunca `window.innerHeight` — no celular ele muda com a barra de endereço e o pin muda de tamanho a cada refresh.
- `ScrollTrigger.config({ ignoreMobileResize: true })` fica em `src/lib/gsap.ts` (resize só de altura no touch não recalcula triggers).
- Elementos com fundo opaco empilhados (ex.: notas no mobile) devem ter a visibilidade controlada pela própria timeline, não só os filhos.

## Conteúdo e OAB

- Os dados reais do escritório estão em `escritorio.ts` como **proposta**. O site só pode ir ao ar pelo escritório ou com autorização dele.
- Não usar números de clientes/casos, "o mais rápido possível", "garantimos" ou similares (Provimento 205/2021).

## Convenções

- Idioma do conteúdo: português do Brasil.
- Publicidade de advocacia segue o Provimento 205/2021 da OAB: sem promessa de resultado, sem mercantilização, tom informativo e sóbrio.
