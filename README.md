# 🎙️ InterviewFlow — Transcrição e Análise Inteligente de Entrevistas

**InterviewFlow** é uma aplicação web desenvolvida em **Next.js (App Router)** com integração à **API da OpenAI**, projetada para **transcrever entrevistas em tempo real**, **analisar pautas automaticamente** e **gerar um resumo final estruturado** em formato de ata.

Ideal para psicólogos, pesquisadores e profissionais que conduzem entrevistas estruturadas, o sistema elimina a necessidade de anotações manuais e gera relatórios automáticos com base em pautas parametrizáveis.

---

## 🚀 Principais Funcionalidades

✅ **Criação e gestão de pautas**
Crie pautas e subpautas diretamente no navegador, salve modelos e reutilize em futuras entrevistas.

🎤 **Transcrição em tempo real**
O áudio é capturado pelo microfone e enviado automaticamente a cada 10 segundos para a API da OpenAI (Whisper ou GPT-4o-mini).

🧠 **Análise automática de temas**
A IA compara a transcrição com as pautas definidas e marca as subpautas abordadas com ✅, colorindo a pauta em verde quando todas são tratadas.

💬 **Transcrição cumulativa**
O texto transcrito aparece continuamente em um campo de rolagem, mantendo todo o histórico da fala.

📋 **Geração de ata e resumo final**
Ao encerrar a entrevista, o sistema gera automaticamente uma ata contendo:

* Tipo da entrevista
* Duração total
* Tabela detalhada com Pauta → Subpauta → Resumo

---

## 🧩 Estrutura de Pastas

```
app/
├── api/
│   ├── analyze/      → Marca subpautas completas
│   │   └── route.js
│   ├── transcribe/   → Transcreve áudio em texto
│   │   └── route.js
│   ├── summarize/    → Gera ata e resumo final
│   │   └── route.js
│   └── test/         → Endpoint de teste/debug
│       └── route.js
├── interview/        → Tela de entrevista em andamento
│   └── page.js
├── page.js           → Tela inicial de criação de pautas
├── layout.js         → Layout global
└── globals.css       → Estilos base
```

---

## ⚙️ Como Funciona (Fluxo Simplificado)

1️⃣ **Criação das Pautas**

* O usuário adiciona pautas e subpautas em `/page.js`.
* Pode salvar modelos no `localStorage` para reutilizar depois.

2️⃣ **Início da Entrevista**

* As pautas são carregadas em `/interview/page.js`.
* Ao clicar em “Iniciar Entrevista”, o microfone é ativado e o contador começa.

3️⃣ **Transcrição Contínua**

* A cada 10 segundos:

  * O áudio é convertido em texto (`/api/transcribe`);
  * O texto é analisado (`/api/analyze`);
  * Subpautas são marcadas como concluídas na tela.

4️⃣ **Finalização e Resumo**

* Ao encerrar, o texto completo é enviado para `/api/summarize`;
* O sistema gera uma **ata + tabela de resumo** com tudo o que foi falado.

---

## 🧠 Tecnologias Utilizadas

| Categoria    | Tecnologia                      |
| ------------ | ------------------------------- |
| Frontend     | Next.js (App Router)            |
| Backend      | Serverless API Routes (Node.js) |
| IA           | OpenAI GPT-4o-mini e Whisper    |
| Áudio        | MediaRecorder API               |
| Persistência | localStorage                    |
| Estilo       | TailwindCSS                     |

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com a sua chave da OpenAI:

```
OPENAI_API_KEY=sk-xxxxx
```

> ⚠️ Em produção (Vercel), defina a variável no painel:
> **Settings → Environment Variables → OPENAI_API_KEY**

---

## 🧭 Diagrama do Ciclo da Aplicação

```mermaid
flowchart TD
A1[🏠 /page.js\nCriação de pautas] --> A2[💾 Salvar modelo no localStorage]
A2 --> A3[▶️ Iniciar entrevista]
A3 --> B1[🎙️ /interview/page.js\nGravação e Transcrição]
B1 --> B2[🧠 /api/transcribe\nÁudio → Texto]
B2 --> B3[📊 /api/analyze\nAnálise das pautas]
B3 --> B4[✅ Atualização visual\nSubpautas completas = verde]
B4 --> B5[💬 Transcrição acumulada na tela]
B5 --> C1[🟥 Finalizar entrevista]
C1 --> C2[🪶 /api/summarize\nGera resumo e ata]
C2 --> C3[📋 Tabela final: "Pauta" &#124; "Subpauta" &#124; "Resumo"]
C3 --> C4[🎯 Fim da entrevista]
```

---

## 🧩 Estrutura de Dados (Padrões de Requisição)

### `/api/transcribe`

```js
FormData {
  audio: Blob // áudio em formato webm
}
```

🔁 **Retorna:**

```json
{ "text": "Trecho falado nos últimos 10 segundos." }
```

---

### `/api/analyze`

```json
{
  "transcript": "Texto transcrito",
  "pautas": [
    {
      "name": "Histórico Familiar",
      "subpautas": [{ "name": "Relação com os pais" }]
    }
  ]
}
```

🔁 **Retorna:**

```json
{
  "pautas": [
    {
      "name": "Histórico Familiar",
      "subpautas": [{ "name": "Relação com os pais", "completa": true }]
    }
  ]
}
```

---

### `/api/summarize`

```json
{
  "tipo": "Entrevista de Acolhimento",
  "pautas": [...],
  "transcript": "Texto completo"
}
```

🔁 **Retorna:**

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
        { "titulo": "Relação com os pais", "resumo": "O entrevistado relatou boa convivência..." }
      ]
    }
  ]
}
```

---

## 🧱 Deploy na Vercel

1. Instale a CLI da Vercel

   ```bash
   npm i -g vercel
   ```

2. Faça login

   ```bash
   vercel login
   ```

3. Faça o deploy

   ```bash
   vercel
   ```

4. Configure no painel da Vercel:

   ```
   OPENAI_API_KEY=sk-xxxxx
   ```

5. ✅ Após o deploy, seu app estará acessível em:

   ```
   https://interviewflow.vercel.app
   ```

---

## 🧩 Melhorias Futuras

* [ ] Suporte a múltiplos idiomas
* [ ] Armazenamento das entrevistas em banco (Supabase ou Firestore)
* [ ] Edição manual pós-transcrição
* [ ] Exportação da ata em PDF
* [ ] Dashboard com métricas de entrevistas

---

## 👨‍💻 Autor

**Ivan Lúcio Teles de Souza**
Agile Master | Dev | AI Enthusiast

📍 São Paulo - SP
💼 [LinkedIn](https://www.linkedin.com/in/ivanlucio/)
📧 [ivanltds@gmail.com](mailto:ivanltds@gmail.com)

