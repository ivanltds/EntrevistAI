// tests/openaiAdapter.test.js
import { OpenAIAdapter } from "../app/api/llm/adapter/openaiAdapter.js";

// Mock da OpenAI
jest.mock("openai", () => require("./__mocks__/openai.js").default);

describe("OpenAIAdapter", () => {
  const adapter = new OpenAIAdapter("fake-key");

  it("gera texto com sucesso", async () => {
    const result = await adapter.generateText("Explique o que é empatia.");
    expect(result).toBe("Resposta simulada do LLM.");
  });

  it("transcreve áudio com sucesso", async () => {
    const result = await adapter.transcribeAudio(Buffer.from("fake-audio"));
    expect(result).toBe("Texto transcrito simulado.");
  });
});
