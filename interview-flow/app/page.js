"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [tipoPauta, setTipoPauta] = useState("");
  const [pautas, setPautas] = useState([]);
  const [pautaInput, setPautaInput] = useState("");
  const [subInput, setSubInput] = useState({});
  const [modelos, setModelos] = useState([]);
  const router = useRouter();

  // 🔁 Carrega modelos de pautas salvos
  useEffect(() => {
    const stored = localStorage.getItem("modelosPautas");
    if (stored) setModelos(JSON.parse(stored));
  }, []);

  // ➕ Adicionar pauta principal
  const addPauta = () => {
    if (!pautaInput.trim()) return;
    setPautas([...pautas, { name: pautaInput.trim(), subpautas: [] }]);
    setPautaInput("");
  };

  // ❌ Remover pauta
  const removePauta = (index) => {
    setPautas(pautas.filter((_, i) => i !== index));
  };

  // ➕ Adicionar subpauta
  const addSubpauta = (index) => {
    const text = subInput[index]?.trim();
    if (!text) return;
    const newPautas = [...pautas];
    newPautas[index].subpautas.push({ name: text, completa: false });
    setPautas(newPautas);
    setSubInput({ ...subInput, [index]: "" });
  };

  // ❌ Remover subpauta
  const removeSubpauta = (pautaIndex, subIndex) => {
    const newPautas = [...pautas];
    newPautas[pautaIndex].subpautas = newPautas[pautaIndex].subpautas.filter(
      (_, i) => i !== subIndex
    );
    setPautas(newPautas);
  };

  // 💾 Salvar modelo de pauta (com verificação de sobrescrita)
  const salvarModelo = () => {
    if (!tipoPauta.trim() || pautas.length === 0) {
      alert("Informe o tipo de pauta e adicione pelo menos uma pauta.");
      return;
    }

    const stored = localStorage.getItem("modelosPautas");
    let novosModelos = stored ? JSON.parse(stored) : [];

    const existenteIndex = novosModelos.findIndex(
      (m) => m.tipo.toLowerCase() === tipoPauta.toLowerCase()
    );

    if (existenteIndex !== -1) {
      const confirmar = confirm(
        `Já existe uma pauta chamada "${tipoPauta}". Deseja sobrescrever os dados existentes?`
      );

      if (!confirmar) {
        alert("Operação cancelada.");
        return;
      }

      novosModelos[existenteIndex] = { tipo: tipoPauta, pautas };
      alert("Pauta atualizada com sucesso! ✅");
    } else {
      novosModelos.push({ tipo: tipoPauta, pautas });
      alert("Pauta salva com sucesso! 🎯");
    }

    setModelos(novosModelos);
    localStorage.setItem("modelosPautas", JSON.stringify(novosModelos));
  };

  // 📥 Carregar modelo existente
  const carregarModelo = (modelo) => {
    setTipoPauta(modelo.tipo);
    setPautas(modelo.pautas);
  };

  // ▶️ Iniciar entrevista (compatível com nova Interview)
  const startInterview = () => {
    if (!pautas.length) return alert("Adicione pelo menos uma pauta.");
    if (!tipoPauta.trim()) return alert("Informe o tipo da pauta.");

    const estrutura = {
      tipo: tipoPauta,
      pautas: pautas.map((p) => ({
        name: p.name,
        completa: false,
        subpautas: (p.subpautas || []).map((s) => ({
          name: s.name,
          completa: false,
        })),
      })),
    };

    // 🔹 Salva no localStorage no formato que a nova Interview espera
    localStorage.setItem("pautas", JSON.stringify(estrutura));
    router.push("/interview");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">🎙️ InterviewFlow</h1>

      {/* Tipo de pauta */}
      <div className="w-full max-w-md mb-4">
        <label className="block mb-1 font-medium">Tipo de pauta</label>
        <input
          value={tipoPauta}
          onChange={(e) => setTipoPauta(e.target.value)}
          placeholder="Ex: Entrevista de Acolhimento"
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>

      {/* Campo para nova pauta */}
      <div className="flex gap-2 w-full max-w-md mb-4">
        <input
          value={pautaInput}
          onChange={(e) => setPautaInput(e.target.value)}
          placeholder="Adicionar pauta"
          className="flex-1 border border-gray-300 rounded-lg p-2"
        />
        <button
          onClick={addPauta}
          className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
        >
          +
        </button>
      </div>

      {/* Lista de pautas e subpautas */}
      <div className="w-full max-w-md flex flex-col gap-3 mb-4">
        {pautas.map((p, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">{p.name}</h2>
              <button
                onClick={() => removePauta(i)}
                className="text-red-500 font-bold"
              >
                ×
              </button>
            </div>

            {/* Adicionar subpauta */}
            <div className="flex gap-2 mb-2">
              <input
                value={subInput[i] || ""}
                onChange={(e) =>
                  setSubInput({ ...subInput, [i]: e.target.value })
                }
                placeholder="Adicionar subpauta"
                className="flex-1 border border-gray-300 rounded-lg p-2"
              />
              <button
                onClick={() => addSubpauta(i)}
                className="bg-green-600 text-white px-3 rounded-lg hover:bg-green-700"
              >
                +
              </button>
            </div>

            {/* Lista de subpautas */}
            {p.subpautas.length > 0 && (
              <ul className="ml-3 list-disc text-gray-700">
                {p.subpautas.map((s, j) => (
                  <li key={j} className="flex justify-between items-center">
                    <span>{s.name}</span>
                    <button
                      onClick={() => removeSubpauta(i, j)}
                      className="text-red-400 text-sm"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Botões principais */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={salvarModelo}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          💾 Salvar Pauta
        </button>

        {pautas.length > 0 && (
          <button
            onClick={startInterview}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            ▶️ Iniciar Entrevista
          </button>
        )}
      </div>

      {/* Modelos salvos */}
      {modelos.length > 0 && (
        <div className="w-full max-w-md">
          <h3 className="font-semibold mb-2">📚 Pautas Salvas</h3>
          <ul className="flex flex-col gap-2">
            {modelos.map((m, i) => (
              <li
                key={i}
                className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center"
              >
                <span>{m.tipo}</span>
                <button
                  onClick={() => carregarModelo(m)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
                >
                  Carregar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
