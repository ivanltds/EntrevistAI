// app/api/llm/llmService.js
export class LLMService {
  constructor(adapter) {
    this.adapter = adapter;
  }

  async generateText(prompt) {
    return await this.adapter.generateText(prompt);
  }

  async transcribeAudio(audioBuffer) {
    return await this.adapter.transcribeAudio(audioBuffer);
  }
}
