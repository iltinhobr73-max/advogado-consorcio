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
- O conteúdo deve ser legível e indexável sem JavaScript: o estado inicial "escondido" das animações é aplicado pelo GSAP (`gsap.set`/`from` no cliente), não por classes CSS no HTML do servidor.
  - Única exceção, contra o flash antes da hidratação: um script inline no `<head>` adiciona a classe `js` ao `<html>`, e `.js [data-gsap-pending]` fica `visibility: hidden`. Todo elemento com `data-gsap-pending` precisa receber `autoAlpha: 1` do GSAP ao montar (inclusive no ramo de reduced motion).

## Onde fica cada coisa

- `src/lib/gsap.ts` — registra os plugins (ScrollTrigger, useGSAP). Importe `gsap`, `ScrollTrigger` e `useGSAP` sempre daqui.
- `src/components/providers/SmoothScroll.tsx` — instância única do Lenis + `useScrollTo()` para rolar até âncoras.
- `src/components/hero/Hero.tsx` — hero "letras miúdas": vídeo do contrato, título tarjado que vira marca-texto, "(continua na próxima página)" como scroll indicator.
- `src/components/leitura/LeituraGuiada.tsx` — seção com pin: "câmera" percorre um contrato e para em 4 cláusulas. Câmera = timeline com scrub suavizado; anotações = timelines em tempo real (stagger 0.2, power3.out) disparadas pela posição da câmera.
- `src/content/contrato.ts` — texto do contrato fictício e das anotações (paradas da câmera).
- `public/media/contrato.mp4` / `contrato-poster.jpg` — contrato de consórcio fictício rolando em loop (gerado). Pode ser trocado por filmagem real de um contrato.

## Direção de arte

O site é um **documento**, não um template de advocacia. Evitar o padrão genérico: fundo escuro, serifa clássica, dourado, botões em pílula, microcopy em caixa alta espaçada, "role" com linha, ícones de balança/martelo, gradientes radiais.

- Paleta: papel (`paper`), tinta (`ink`) e marca-texto (`marker`). O amarelo só aparece onde algo é "destacado".
- Tipografia: Archivo condensado e pesado (`.font-display`) para display; IBM Plex Mono para notas de margem, numeração, metadados e notas de rodapé.
- Vocabulário visual de contrato: tarjas, marca-texto, notas de rodapé (¹), numeração de linhas, "fl. 01", régua fina, cantos retos.
- Cada seção deve ter uma ideia ligada ao assunto (consórcio/contrato), não só um layout.
- Cabeçalho de documento em cada seção (mono, régua fina) com numeração de folha contínua: hero = fl. 01, leitura guiada = fl. 02, e assim por diante.

## Armadilhas conhecidas

- Tailwind v4: `scale-*`, `rotate-*` e `translate-*` usam as propriedades CSS `scale`/`rotate`/`translate`, que se SOMAM ao `transform` do GSAP. Em elemento animado pelo GSAP, não usar essas classes — defina o estado inicial com `gsap.set`.
- GSAP não interpola `var(--cor)`: use o valor hex.
- **Pin + Lenis: nunca usar `anticipatePin`.** Ele prevê o pin pela velocidade do scroll nativo, mas aqui o `ScrollTrigger.update` vem do Lenis; em flicks no celular o palco saltava ~110px.
- **Comprimento de pin/scrub em altura estável**: use a altura de um elemento `h-svh` (ex.: `stage.clientHeight`), nunca `window.innerHeight` — no celular ele muda com a barra de endereço e o pin muda de tamanho a cada refresh.
- `ScrollTrigger.config({ ignoreMobileResize: true })` fica em `src/lib/gsap.ts` (resize só de altura no touch não recalcula triggers).
- Elementos com fundo opaco empilhados (ex.: notas no mobile) devem ter a visibilidade controlada pela própria timeline, não só os filhos.

## Convenções

- Idioma do conteúdo: português do Brasil.
- Publicidade de advocacia segue o Provimento 205/2021 da OAB: sem promessa de resultado, sem mercantilização, tom informativo e sóbrio.
