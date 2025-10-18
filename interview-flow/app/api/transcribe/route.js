// app/api/transcribe/route.js
import { createLLM } from "../llm/llmFactory.js";

export async function POST(req) {
  const llm = createLLM();
  const formData = await req.formData();
  const audio = formData.get("file");

  if (!audio) {
    return Response.json({ error: "Arquivo de áudio não enviado." }, { status: 400 });
  }

  const text = await llm.transcribeAudio(audio);
  return Response.json({ text });
}
