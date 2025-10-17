%%---------------------------------------------
%%  InterviewFlow - Ciclo Completo da Aplicação
%%---------------------------------------------
flowchart TD

%% SEÇÃO 1 — CRIAÇÃO DE PAUTAS
A1[🏠 /page.js\nTela inicial] --> A2[🧾 Usuário cria pautas e subpautas]
A2 --> A3[💾 Salva modelo no localStorage\n(modelosPautas)]
A3 --> A4[▶️ Inicia entrevista]
A4 -->|Grava tipo e pautas atuais| A5[➡️ Redireciona para /interview/page.js]

%% SEÇÃO 2 — INÍCIO DA ENTREVISTA
A5 --> B1[🎙️ /interview/page.js\nTela de entrevista]
B1 --> B2[🔹 Carrega pautas do localStorage\n(pautasAtuais)]
B2 --> B3[🟢 Botão “Iniciar Entrevista”\nativa o microfone e contador]
B3 --> B4[MediaRecorder inicia captura\na cada 1s (chunks)]
B4 --> B5[⏱️ Intervalo de 10s iniciado\n(intervalRef)]

%% SEÇÃO 3 — CICLO A CADA 10s
B5 --> C1[📤 Para gravação temporariamente]
C1 --> C2[📦 Monta Blob de áudio\n(audioChunksRef → Blob)]
C2 --> C3[🌐 POST /api/transcribe\nEnvia áudio → Texto]
C3 --> C4[🧠 /api/analyze\nCompara texto com pautas]
C4 --> C5[✅ Atualiza estado das pautas\n(setPautas(updated))]
C5 --> C6[🎨 UI reativa\nsubpautas = verde, pauta = verde se todas ✅]
C6 -->|Reinicia gravação| B5

%% SEÇÃO 4 — VISUALIZAÇÃO EM TEMPO REAL
B5 --> D1[💬 Transcrição cumulativa\nAtualiza textarea na tela]
D1 --> D2[📋 Pautas atualizadas em tempo real]

%% SEÇÃO 5 — FINALIZAÇÃO
B5 -->|Usuário clica “Finalizar”| E1[🟥 Para gravação e limpa intervalos]
E1 --> E2[📄 POST /api/summarize\nEnvia tipo, pautas e transcrição]
E2 --> E3[🧩 Modelo gera resumo final estruturado]
E3 --> E4[📊 Renderiza tabela final\n(Pauta | Subpauta | Resumo)]
E4 --> E5[💬 Transcrição continua visível abaixo]
E5 --> E6[🧭 Fim da entrevista]

%% SEÇÃO 6 — ROTAS BACKEND
C3 -.-> F1[/api/transcribe\n🎧 Converte áudio → texto]
C4 -.-> F2[/api/analyze\n🧠 Marca subpautas completas]
E2 -.-> F3[/api/summarize\n🪶 Gera resumo final em JSON]

%% SEÇÃO 7 — RESULTADOS
E4 --> G1[🧠 IA devolve JSON:\n{ ata, resumo: [{pauta, subpautas:[{titulo, resumo}]}]}]
G1 --> G2[📋 UI converte JSON → tabela]
G2 --> G3[🎯 Entrevista completa com histórico de fala e relatório final]
