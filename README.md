🏠 Etapa 1 — Criação de Pautas

O usuário define as pautas e subpautas;

Pode salvar modelos e reusar;

Ao iniciar, o app grava os dados no localStorage e redireciona.

🎙️ Etapa 2 — Início da Entrevista

A tela carrega as pautas do armazenamento local;

O botão “Iniciar” ativa o microfone, começa o contador e inicializa o MediaRecorder.

⏱️ Etapa 3 — Ciclo de 10 segundos

A cada 10s o áudio é:

Parado;

Montado em Blob;

Enviado para /api/transcribe;

Resultado de texto vai para /api/analyze;

A tela é atualizada com pautas completadas.

💬 Etapa 4 — Transcrição em tempo real

O texto acumulado aparece no campo inferior (scrollável);

O progresso visual das pautas é atualizado em tempo real.

📄 Etapa 5 — Finalização

Ao clicar “Finalizar”, o app:

Para tudo;

Gera o resumo final com /api/summarize;

Exibe uma tabela organizada com pauta, subpauta e resumo;

Mantém o texto transcrito visível acima.