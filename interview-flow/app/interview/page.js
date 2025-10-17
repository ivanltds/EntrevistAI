"use client";
import { useEffect, useState, useRef } from "react";

export default function InterviewPage() {
  const [tipo, setTipo] = useState("");
  const [pautas, setPautas] = useState([]);
  const [transcricao, setTranscricao] = useState("Aguardando transcrição...");
  const [gravando, setGravando] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [resumoFinal, setResumoFinal] = useState(null);

  const intervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🔹 Carrega dados da entrevista
  useEffect(() => {
    const stored = localStorage.getItem("pautas");
    if (stored) {
      const data = JSON.parse(stored);
      setTipo(data.tipo || "Entrevista");
      setPautas(data.pautas || []);
    }
  }, []);

  // ⏱️ Contador de tempo
  useEffect(() => {
    let counter;
    if (gravando) {
      counter = setInterval(() => setTempo((t) => t + 1), 1000);
    }
    return () => clearInterval(counter);
  }, [gravando]);

  // 🎤 Configuração e envio do áudio real a cada 10s (corrigido)
  useEffect(() => {
    if (!gravando) return;

    const iniciarGravacao = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        // Função que para, envia e reinicia o gravador a cada 10s
        const enviarAudio = async () => {
          if (!mediaRecorderRef.current) return;

          const recorder = mediaRecorderRef.current;

          if (recorder.state !== "inactive") recorder.stop();

          await new Promise((resolve) => {
            recorder.onstop = async () => {
              if (audioChunksRef.current.length === 0) return resolve();

              const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
              audioChunksRef.current = [];

              const formData = new FormData();
              formData.append("audio", audioBlob, "entrevista.webm");

              try {
                // 🔹 1. Transcrição
                const transcribeRes = await fetch("/api/transcribe", {
                  method: "POST",
                  body: formData,
                });

                const transData = await transcribeRes.json();
                const texto = transData.text || "Sem texto detectado.";
                
                setTranscricao((prev) =>
                  prev === "Aguardando transcrição..." ? texto : prev + "\n" + texto
                );

                // 🔹 2. Análise das pautas
                const analyzeRes = await fetch("/api/analyze", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    transcript: transcricao,
                    pautas,
                  }),
                });
                const updated = await analyzeRes.json();
                if (updated && (updated.pautasAtualizadas || updated.pautas))
                  setPautas(updated.pautasAtualizadas || updated.pautas);
              } catch (err) {
                console.error("Erro ao enviar áudio:", err);
              }

              resolve();
            };
          });

          // Reinicia a gravação imediatamente após enviar
          recorder.start(1000);
        };

        // Inicia e agenda o envio periódico
        mediaRecorder.start(1000);
        intervalRef.current = setInterval(enviarAudio, 10000);
        console.log("🎤 Gravação iniciada com reinício automático a cada 10s");
      } catch (err) {
        console.error("Erro ao acessar microfone:", err);
        alert("⚠️ Não foi possível acessar o microfone. Verifique as permissões.");
        setGravando(false);
      }
    };

    iniciarGravacao();

    // 🧹 Limpeza
    return () => {
      clearInterval(intervalRef.current);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [gravando, pautas]);

  const iniciarEntrevista = () => {
    if (!pautas.length) return alert("Nenhuma pauta carregada.");
    setGravando(true);
    setTranscricao("🎙️ Gravando entrevista...");
  };

  const finalizarEntrevista = async () => {
    const confirmar = confirm("Deseja finalizar a entrevista?");
    if (!confirmar) return;

    clearInterval(intervalRef.current);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }

    setGravando(false);
    setTranscricao("✅ Entrevista finalizada. Gerando resumo...");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          pautas,
          transcript: transcricao,
        }),
      });

      const data = await res.json();
      setResumoFinal(data);
      setTranscricao("✅ Entrevista finalizada. Resumo pronto!");
    } catch (err) {
      console.error("Erro ao gerar resumo:", err);
      setTranscricao("⚠️ Erro ao gerar resumo final.");
    }
  };

  const tempoFormatado = `${String(Math.floor(tempo / 60)).padStart(2, "0")}:${String(
    tempo % 60
  ).padStart(2, "0")}`;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">
        🎙️ {gravando ? `Entrevista: ${tipo}` : tipo || "Entrevista em andamento"}
      </h1>

      <button
        onClick={gravando ? finalizarEntrevista : iniciarEntrevista}
        className={`px-6 py-2 text-white rounded-lg font-semibold mb-4 ${
          gravando ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {gravando ? "Finalizar" : "Iniciar"}
      </button>

      {gravando && <div className="text-sm text-gray-600 mb-4">⏱️ Tempo: {tempoFormatado}</div>}

      {pautas.length > 0 && (
        <div className="w-full max-w-2xl mb-4 space-y-4">
          {pautas.map((pauta, i) => {
            const todasOk = pauta.subpautas.every((s) => s.completa);
            return (
              <div
                key={i}
                className={`border rounded-lg p-4 shadow-sm ${
                  todasOk ? "bg-green-50 border-green-400" : "bg-white"
                }`}
              >
                <h2 className="font-semibold text-lg mb-2">{pauta.name}</h2>
                <ul className="ml-4 list-disc">
                  {pauta.subpautas.map((sub, j) => (
                    <li
                      key={j}
                      className={`flex items-center gap-1 ${
                        sub.completa ? "text-green-700" : "text-gray-700"
                      }`}
                    >
                      {sub.name} {sub.completa ? "✅" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* 💬 Campo de transcrição sempre visível */}
      <textarea
        readOnly
        value={transcricao}
        className="w-full max-w-2xl h-48 p-3 border rounded-lg bg-gray-100 text-gray-700 mb-6"
      />

      {/* 📊 Tabela resumo final (empurra transcrição para baixo) */}
      {resumoFinal && (
        <div className="w-full max-w-3xl mt-4 border rounded-lg bg-white p-5 shadow animate-fadeIn">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            📋 Resumo da Entrevista
          </h2>

          {resumoFinal.ata && (
            <div className="mb-4 text-sm text-gray-700">
              <p><strong>Tipo:</strong> {resumoFinal.ata.tipo}</p>
              {resumoFinal.ata.duracao && (
                <p><strong>Duração:</strong> {resumoFinal.ata.duracao}</p>
              )}
            </div>
          )}

          {(() => {
            const resumoArray = Array.isArray(resumoFinal.resumo)
              ? resumoFinal.resumo
              : resumoFinal.resumo
              ? Object.values(resumoFinal.resumo)
              : [];

            if (resumoArray.length === 0) {
              return <p className="text-gray-500 text-sm">Nenhum dado de resumo disponível.</p>;
            }

            return (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left p-2 w-1/4">Pauta</th>
                    <th className="text-left p-2 w-1/4">Subpauta</th>
                    <th className="text-left p-2 w-2/4">Resumo</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoArray.map((pauta, i) =>
                    pauta.subpautas?.map((sub, j) => (
                      <tr key={`${i}-${j}`} className="border-b hover:bg-gray-50">
                        <td className="p-2 align-top font-medium">{pauta.pauta}</td>
                        <td className="p-2 align-top">{sub.titulo}</td>
                        <td className="p-2 align-top text-gray-700">{sub.resumo}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            );
          })()}
        </div>
      )}
    </main>
  );
}
