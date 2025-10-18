// tests/__mocks__/openai.js
export default class OpenAI {
  constructor() {
    this.chat = {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: "Resposta simulada do LLM." } }],
        }),
      },
    };

    this.audio = {
      transcriptions: {
        create: jest.fn().mockResolvedValue({
          text: "Texto transcrito simulado.",
        }),
      },
    };
  }
}
    