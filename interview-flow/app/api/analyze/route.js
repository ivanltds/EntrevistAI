// app/api/analyze/route.js
import { createLLM } from "../llm/llmFactory.js";

export async function POST(req) {
  const { transcript, pautas } = await req.json();
  const llm = createLLM();

  const prompt = `
Você é um analista de entrevistas clínicas.
Transcrição: ${transcript}
Pautas: ${JSON.stringify(pautas)}
`;

  const analysis = await llm.generateText(prompt);
  return Response.json({ analysis });
}
