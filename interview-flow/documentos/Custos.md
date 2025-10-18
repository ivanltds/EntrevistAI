💬 Custos por Sessão de Atendimento

Cada sessão de atendimento tem duração máxima de 1 hora e envolve duas etapas automáticas:

Transcrição do áudio da sessão (voz → texto)

Análise do conteúdo (identificação de temas, palavras-chave e resumo do atendimento)

🧩 1. Versão inicial — OpenAI completa

Nesta fase, tudo é processado diretamente pela OpenAI.

Transcrição: feita com o modelo Whisper-1

Análise de texto: feita com o modelo GPT-4o-mini

💵 Custo médio por sessão de 1 hora:
≈ US$ 0,38 (≈ R$ 2,30)

Essa versão é ideal para o piloto porque:

É simples de integrar.

Permite validar a experiência dos psicólogos e a qualidade das transcrições e análises.

⚙️ 2. Versão otimizada — fase futura

Após a validação da V1, o sistema será ajustado para reduzir custos:

Transcrição feita localmente (sem custo de API).

Análise feita em blocos a cada alguns minutos.

Somente trechos novos (delta) são analisados.

💵 Custo médio por sessão de 1 hora:
≈ US$ 0,02 (≈ R$ 0,12)