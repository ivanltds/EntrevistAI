// testLLM.js
import { createLLM } from "../app/api/llm/llmFactory.js";

const runTest = async () => {
  const llm = createLLM();
  const text = await llm.generateText("Explique o que é escuta ativa.");
  console.log("🧠 Resposta da LLM:");
  console.log(text);
};

runTest().catch(console.error);
