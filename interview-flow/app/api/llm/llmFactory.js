// app/api/llm/llmFactory.js
import { OpenAIAdapter } from "./adapter/openaiAdapter.js";
import { LLMService } from "./llmService.js";

export function createLLM() {
  const provider = process.env.LLM_PROVIDER || "openai";
  const apiKey = process.env.OPENAI_API_KEY;

  switch (provider) {
    case "openai":
      return new LLMService(new OpenAIAdapter(apiKey));

    // 🔧 Exemplo futuro:
    // case "ollama":
    //   return new LLMService(new OllamaAdapter());
    default:
      throw new Error(\`Provedor LLM desconhecido: \${provider}\`);
  }
}
