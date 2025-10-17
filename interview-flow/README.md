
# 🧠 InterviewFlow — Documentação Técnica

## 📋 Visão Geral

**InterviewFlow** é uma aplicação full-stack em **Next.js (App Router)** com **rotas serverless** integradas à **API da OpenAI**, criada para automatizar a transcrição, análise e sumarização de entrevistas.

O objetivo é permitir a **condução de entrevistas com pauta parametrizável**, marcando automaticamente os temas abordados e gerando um **resumo final estruturado** (ata).

---

## ⚙️ Stack Técnica

| Camada              | Tecnologia                                |
| ------------------- | ----------------------------------------- |
| Frontend            | Next.js 15 (App Router, React 18)         |
| Estilo              | TailwindCSS                               |
| Áudio               | MediaRecorder API                         |
| Backend             | Serverless Functions (API Routes Next.js) |
| IA                  | OpenAI GPT-4o-mini + Whisper              |
| Armazenamento Local | `localStorage` (browser)                  |
| Deploy              | Vercel                                    |

---

## 🏗️ Estrutura de Pastas

```
app/
├── api/
│   ├── analyze/
│   │   └── route.js       → Marca pautas/subpautas completas
│   ├── summarize/
│   │   └── route.js       → Gera ata e resumo final
│   ├── transcribe/
│   │   └── route.js       → Transcreve áudio (Whisper)
│   └── test/
│       └── route.js       → Endpoint opcional de debug
│
├── interview/
│   └── page.js            → Lógica principal da entrevista
│
├── page.js                → Tela inicial (criação e gerenciamento de pautas)
├── layout.js              → Layout global da aplicação
└── globals.css            → Estilos base e tema
```

---

## 🔑 Variáveis de Ambiente

Arquivo `.env.local`:

```bash
OPENAI_API_KEY=sk-xxxxx
```

Na Vercel:

```
Settings → Environment Variables → OPENAI_API_KEY
```

---

## 🧩 Fluxo Lógico (Resumido)

### 1️⃣ Criação de Pautas (`/page.js`)

* Usuário define o **tipo de pauta** (ex: “Entrevista de Acolhimento”);
* Cria pautas e subpautas manualmente;
* Pode salvar modelos em `localStorage` (`modelosPautas`);
* Pode carregar e sobrescrever modelos existentes;
* Ao clicar em “Iniciar Entrevista”, o app salva:

  ```json
  { "tipo": "Acolhimento", "pautas": [...] }
  ```

  em `localStorage` (`pautasAtuais`) e redireciona para `/interview`.

---

### 2️⃣ Entrevista em Andamento (`/interview/page.js`)

#### 🔹 Início:

* Carrega `pautasAtuais` do `localStorage`;
* Solicita permissão do microfone via `navigator.mediaDevices`;
* Inicia o `MediaRecorder` com chunks de 1s;
* Dispara `setInterval` de 10s para:

  1. Parar o gravador;
  2. Enviar áudio para `/api/transcribe`;
  3. Receber texto transcrito;
  4. Enviar texto + pautas para `/api/analyze`;
  5. Atualizar status das subpautas (`completa = true`);
  6. Reiniciar a gravação.

#### 🔹 Durante a gravação:

* Exibe cronômetro `⏱️ mm:ss`;
* Mostra transcrição cumulativa;
* Atualiza interface das pautas em tempo real:

  * Subpautas completas → ✅;
  * Pauta inteira → fundo verde quando todas as subpautas estão completas.

#### 🔹 Finalização:

* Usuário clica “Finalizar”;
* Gravação é encerrada e intervalos limpos;
* Envia `{ tipo, pautas, transcript }` para `/api/summarize`;
* Exibe tabela de resumo (ata) **abaixo da transcrição**.

---

## 📡 Rotas de API

### `/api/transcribe/route.js`

**Entrada:**
`FormData` com `audio` (Blob, formato WebM)

**Processo:**

* Usa `openai.audio.transcriptions.create()`
* Modelo: `whisper-1` ou `gpt-4o-mini-transcribe`

**Saída:**

```json
{ "text": "trecho transcrito" }
```

---

### `/api/analyze/route.js`

**Entrada:**

```json
{
  "transcript": "texto atual",
  "pautas": [
    {
      "name": "Histórico Familiar",
      "subpautas": [{ "name": "Relação com os pais" }]
    }
  ]
}
```

**Prompt interno:**
Solicita ao modelo para:

* Marcar `subpauta.completa = true` se o tema foi mencionado (mesmo com sinônimos);
* Retornar as pautas atualizadas.

**Saída esperada:**

```json
{
  "pautas": [
    {
      "name": "Histórico Familiar",
      "subpautas": [
        { "name": "Relação com os pais", "completa": true }
      ]
    }
  ]
}
```

---

### `/api/summarize/route.js`

**Entrada:**

```json
{
  "tipo": "Entrevista de Acolhimento",
  "pautas": [...],
  "transcript": "texto completo"
}
```

**Prompt interno:**
Gera um resumo temático por pauta e subpauta, estruturado em JSON.

**Saída esperada:**

```json
{
  "ata": {
    "tipo": "Entrevista de Acolhimento",
    "duracao": "12min"
  },
  "resumo": [
    {
      "pauta": "Histórico Familiar",
      "subpautas": [
        {
          "titulo": "Relação com os pais",
          "resumo": "O entrevistado relatou boa convivência..."
        }
      ]
    }
  ]
}
```

---

## 🧮 Lógica de Atualização das Pautas

1. O transcript parcial (últimos 10s) é enviado para análise;
2. O modelo avalia o texto e retorna subpautas marcadas com `completa: true`;
3. O frontend atualiza o estado de `pautas` com `setPautas(updated.pautas)`;
4. A renderização reativa do React pinta:

   * Subpautas com ✅;
   * Pauta com fundo verde se todas as subpautas tiverem `completa = true`.

---

## 🧾 Resumo Final (Renderização)

Renderizado apenas se `resumoFinal.resumo` for array válido:

* Mostrado abaixo da transcrição;
* A transcrição continua visível (não substituída);
* Estrutura HTML:

  ```html
  <table>
    <thead>...</thead>
    <tbody>
      <tr>
        <td>Pauta</td>
        <td>Subpauta</td>
        <td>Resumo</td>
      </tr>
    </tbody>
  </table>
  ```

---

## 🧰 Logs e Debug

Durante a gravação:

```bash
🎤 Gravação iniciada com reinício automático a cada 10s
```

Possíveis mensagens:

* `⚠️ Não foi possível acessar o microfone` → Falha de permissão;
* `"Sem texto detectado."` → Whisper não conseguiu extrair fala;
* `"Erro no ciclo de 10s:"` → Falha em fetch da transcrição ou análise.

---

## 🧹 Limpeza e Encerramento

* Ao finalizar:

  * `mediaRecorder.stop()`
  * `track.stop()` em todos os canais de áudio;
  * `clearInterval(intervalRef.current)`
* Isso garante que o microfone seja liberado e a sessão encerrada com segurança.

---

## 🧭 Ciclo Completo da Aplicação

```mermaid
flowchart TD
A1[🏠 Criação de Pautas] --> A2[💾 Salvar modelo no localStorage]
A2 --> A3[▶️ Iniciar entrevista]
A3 --> B1[🎙️ Gravação e Transcrição]
B1 --> B2[🧠 /api/transcribe - Áudio → Texto]
B2 --> B3[📊 /api/analyze - Avalia pautas]
B3 --> B4[✅ Atualiza UI - Subpautas completas]
B4 --> B5[💬 Mostra transcrição em tempo real]
B5 --> C1[🟥 Finalizar entrevista]
C1 --> C2[🪶 /api/summarize - Gera resumo final]
C2 --> C3[📋 Exibe tabela (Pauta/Subpauta/Resumo)]
C3 --> C4[🎯 Fim do processo]
```

---

## 🔍 Dicas para Desenvolvimento

* Execute localmente:

  ```bash
  npm install
  npm run dev
  ```
* Teste APIs via Postman com exemplos JSON;
* Em ambiente Codespaces, garanta que o browser tenha permissão de microfone;
* Em produção (Vercel), os endpoints rodam em **Node serverless**, sem restrições de rede — ideal para as chamadas OpenAI.

---

## 🧩 Próximas Evoluções

* [ ] Agrupar transcrições em buffer maior para contexto mais amplo na análise
* [ ] Cache de trechos já analisados
* [ ] Exportar ata em PDF
* [ ] Dashboard de entrevistas anteriores
* [ ] Filtros por status de pauta

---

**Manutenção:** Ivan Lúcio Teles de Souza
📧 `ivanltds@gmail.com` | 🧠 @ivanltds on GitHub
