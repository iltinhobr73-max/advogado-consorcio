# Advocacia em consórcios — site

Site em formato de **documento**: cada seção é uma folha (fl. 01 a fl. 07) de um contrato que o escritório lê pelo cliente.

| Folha | Seção |
|---|---|
| fl. 01 | Hero — frase tarjada que vira marca-texto, contrato rolando ao fundo |
| fl. 02 | Leitura guiada — seção fixada; uma "câmera" percorre o contrato e para em 4 cláusulas |
| fl. 03 | Dos pedidos — serviços (a, b, c) e modo de atendimento (I–IV) |
| fl. 04 | Qualificação — sobre o advogado |
| fl. 05 | Declarações — avaliações de clientes |
| fl. 06 | Quesitos — perguntas frequentes |
| fl. 07 | Encaminhamento — formulário com envio do contrato + canais de contato |

Stack: Next.js (App Router) · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis. Regras de animação e direção de arte em [`CLAUDE.md`](./CLAUDE.md).

## Rodar

```bash
npm install
npm run dev
```

## Antes de publicar

1. **Autorização do escritório.** Os dados em `src/content/escritorio.ts` (nome, OAB, contatos, depoimentos) foram preenchidos a partir do site público atual, como proposta.
2. **Envio do formulário.** Defina `CONTACT_WEBHOOK_URL` (webhook de automação, CRM ou serviço de e-mail que aceite `multipart/form-data`). Sem ela, o formulário avisa que o envio não está ativo.
3. **Foto e logo em alta.** `public/media/advogado.jpg` (208×337) e o monograma vieram de arquivos pequenos. Com versões maiores, basta substituir a foto; para o logo, o ideal é o arquivo vetorial (SVG/PDF) do escritório.
4. **Vídeo do hero.** `public/media/contrato.mp4` é provisório (gerado).
5. **Revisão jurídica** das referências legais (`src/content/contrato.ts`) e dos textos (`escritorio.ts`).
