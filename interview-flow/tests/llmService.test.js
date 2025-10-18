// tests/llmService.test.js
import { LLMService } from "../app/api/llm/llmService.js";

describe("LLMService", () => {
  const mockAdapter = {
    generateText: jest.fn().mockResolvedValue("Mock: resposta de texto"),
    transcribeAudio: jest.fn().mockResolvedValue("Mock: áudio transcrito"),
  };

  const llm = new LLMService(mockAdapter);

  it("chama generateText() do adapter corretamente", async () => {
    const response = await llm.generateText("Teste prompt");
    expect(mockAdapter.generateText).toHaveBeenCalledWith("Teste prompt");
    expect(response).toBe("Mock: resposta de texto");
  });

  it("chama transcribeAudio() do adapter corretamente", async () => {
    const response = await llm.transcribeAudio(Buffer.from("audio"));
    expect(mockAdapter.transcribeAudio).toHaveBeenCalled();
    expect(response).toBe("Mock: áudio transcrito");
  });
});
