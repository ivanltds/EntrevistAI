// app/api/summarize/route.js
import { openai } from "@/lib/openai";

const promptFor = (transcript, pautas, tipo, duracao) => `
Gere uma ata final, em JSON válido, cobrindo cada pauta e subpauta com um resumo curto (2-3 frases).
Formato EXATO:
{
  "ata": {
    "tipo": "string",
    "duracao": "mm:ss",
    "resumo": [
      {
        "pauta": "nome",
        "subpautas": [
          { "titulo": "nome", "resumo": "texto curto" }
        ]
      }
    ]
  }
}

Tipo: "${tipo}"
Duração: "${duracao}"

Transcrição completa:
"""${transcript}"""

Pautas (completas e incompletas):
${JSON.stringify(pautas, null, 2)}
`;

function extractJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

export async function POST(req) {
  try {
    const { transcript, pautas, tipo, duracao } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: promptFor(transcript, pautas, tipo, duracao) }],
      temperature: 0.2,
    });

    const raw = completion.choices[0].message.content?.trim() || "{}";
    let ata;
    try {
      ata = JSON.parse(extractJSON(raw));
    } catch (e) {
      console.error("SUMMARIZE PARSE ERROR:", e, raw);
      ata = {
        ata: {
          tipo: tipo || "Entrevista",
          duracao: duracao || "00:00",
          resumo: pautas.map(p => ({
            pauta: p.name,
            subpautas: p.subpautas.map(s => ({
              titulo: s.name,
              resumo: "(sem resumo por falha na IA)"
            }))
          }))
        }
      };
    }

    return new Response(JSON.stringify(ata), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("SUMMARIZE ERROR:", e);
    return new Response(JSON.stringify({ ata: null }), {
      headers: { "Content-Type": "application/json" }, status: 500
    });
  }
}
