/**
 * Recebe o formulário de encaminhamento (multipart).
 *
 * Destino: defina CONTACT_WEBHOOK_URL (ex.: um webhook de automação, CRM ou
 * serviço de e-mail que aceite multipart/form-data). Sem essa variável, a
 * rota responde 503 "not_configured" — o site NUNCA finge que enviou.
 */

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB por arquivo
const MAX_FILES = 8;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const SITUACOES = ["pagando", "desisti", "contemplado", "promessa"];

function bad(field: string) {
  return Response.json({ ok: false, error: "invalid", field }, { status: 400 });
}

export async function POST(request: Request) {
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return bad("form");
  }

  const nome = String(data.get("nome") ?? "").trim();
  const whatsapp = String(data.get("whatsapp") ?? "").replace(/\D/g, "");
  const administradora = String(data.get("administradora") ?? "").trim();
  const situacao = String(data.get("situacao") ?? "");
  const consentimento = data.get("consentimento") === "on";
  const arquivos = data.getAll("contrato").filter((f): f is File => f instanceof File && f.size > 0);

  if (nome.length < 2 || nome.length > 120) return bad("nome");
  if (whatsapp.length < 10 || whatsapp.length > 13) return bad("whatsapp");
  if (administradora.length > 120) return bad("administradora");
  if (!SITUACOES.includes(situacao)) return bad("situacao");
  if (!consentimento) return bad("consentimento");
  if (arquivos.length > MAX_FILES) return bad("contrato");
  for (const f of arquivos) {
    if (f.size > MAX_FILE_BYTES || !ACCEPTED.includes(f.type)) return bad("contrato");
  }

  const destino = process.env.CONTACT_WEBHOOK_URL;
  if (!destino) {
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const payload = new FormData();
  payload.set("nome", nome);
  payload.set("whatsapp", whatsapp);
  payload.set("administradora", administradora);
  payload.set("situacao", situacao);
  payload.set("recebido_em", new Date().toISOString());
  arquivos.forEach((f) => payload.append("contrato", f, f.name));

  try {
    const res = await fetch(destino, { method: "POST", body: payload });
    if (!res.ok) throw new Error(`webhook ${res.status}`);
  } catch (err) {
    console.error("[contato] falha ao encaminhar:", err);
    return Response.json({ ok: false, error: "upstream" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
