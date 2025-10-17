import { openai } from "@/lib/openai";

export async function GET() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Você é um assistente amigável." },
      { role: "user", content: "Diga olá em uma frase curta." }
    ],
  });

  return new Response(
    JSON.stringify({ reply: completion.choices[0].message.content }),
    { headers: { "Content-Type": "application/json" } }
  );
}