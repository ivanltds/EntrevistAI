// app/api/transcribe/route.js
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio");

    if (!file) {
      return new Response(JSON.stringify({ error: "Nenhum áudio enviado." }), { status: 400 });
    }

    // 🔑 sua chave OpenAI (configure no .env.local)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Converte o arquivo em buffer para envio
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 🔹 Transcrição real com Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], "audio.webm"),
      model: "gpt-4o-mini-transcribe", // Modelo novo (rápido e barato)
      // use "whisper-1" se preferir o Whisper clássico
    });

    return new Response(JSON.stringify({ text: transcription.text }), { status: 200 });
  } catch (error) {
    console.error("Erro na transcrição:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
