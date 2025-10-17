// app/api/analyze/route.js
import { openai } from "@/lib/openai";

const promptFor = (transcript, pautas) => `
Você recebe uma transcrição e uma lista de pautas com subpautas.
Defina "completa": true/false para cada subpauta que foi abordada no texto,
mesmo que implicitamente, com sinônimos ou termos relacionados.
Uma pauta só está completa quando TODAS as subpautas estiverem completas.
Responda APENAS com JSON válido no formato:

[
  { "name": "Pauta", "completa": true/false, "subpautas": [
    { "name": "Subpauta", "completa": true/false }
  ]}
]

Transcrição:
"""${transcript}"""

Pautas atuais:
${JSON.stringify(pautas, null, 2)}
`;

function extractJSON(text) {
  // tenta achar o primeiro bloco JSON válido
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text; // tenta direto
}

export async function POST(req) {
  try {
    const { transcript, pautas } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: promptFor(transcript, pautas) }],
      temperature: 0.2,
    });

    const raw = completion.choices[0].message.content || "[]";
    let parsed;
    try {
      parsed = JSON.parse(extractJSON(raw));
    } catch {
      parsed = pautas; // fallback mantém estado
    }

    // garante a regra da pauta completa = todas subpautas true
    const coerced = parsed.map(p => ({
      name: p.name,
      subpautas: (p.subpautas || []).map(s => ({ name: s.name, completa: !!s.completa })),
      completa: (p.subpautas || []).every(s => !!s.completa),
    }));

    return new Response(JSON.stringify({ pautasAtualizadas: coerced }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("ANALYZE ERROR:", e);
    return new Response(JSON.stringify({ pautasAtualizadas: [] }), {
      headers: { "Content-Type": "application/json" }, status: 500
    });
  }
}
