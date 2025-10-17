"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [themes, setThemes] = useState([]);
  const [themeInput, setThemeInput] = useState("");
  const [subInput, setSubInput] = useState({});
  const router = useRouter();

  // Adiciona tema principal
  const addTheme = () => {
    if (!themeInput.trim()) return;
    setThemes([...themes, { name: themeInput, subthemes: [] }]);
    setThemeInput("");
  };

  // Remove tema
  const removeTheme = (index) => {
    setThemes(themes.filter((_, i) => i !== index));
  };

  // Adiciona subtema a um tema
  const addSubtheme = (index) => {
    const text = subInput[index]?.trim();
    if (!text) return;
    const newThemes = [...themes];
    newThemes[index].subthemes.push({ name: text });
    setThemes(newThemes);
    setSubInput({ ...subInput, [index]: "" });
  };

  // Remove subtema
  const removeSubtheme = (themeIndex, subIndex) => {
    const newThemes = [...themes];
    newThemes[themeIndex].subthemes = newThemes[themeIndex].subthemes.filter(
      (_, i) => i !== subIndex
    );
    setThemes(newThemes);
  };

  // Iniciar entrevista
  const startInterview = () => {
    localStorage.setItem("themes", JSON.stringify(themes));
    router.push("/interview");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">🎙️ InterviewFlow</h1>

      {/* Campo para novo tema */}
      <div className="flex gap-2 w-full max-w-md mb-4">
        <input
          value={themeInput}
          onChange={(e) => setThemeInput(e.target.value)}
          placeholder="Adicionar tema"
          className="flex-1 border border-gray-300 rounded-lg p-2"
        />
        <button
          onClick={addTheme}
          className="bg-blue-600 text-white px-4 rounded-lg"
        >
          +
        </button>
      </div>

      {/* Lista de temas e subtemas */}
      <div className="w-full max-w-md flex flex-col gap-3">
        {themes.map((t, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">{t.name}</h2>
              <button
                onClick={() => removeTheme(i)}
                className="text-red-500 font-bold"
              >
                ×
              </button>
            </div>

            {/* Subtemas */}
            <div className="flex gap-2 mb-2">
              <input
                value={subInput[i] || ""}
                onChange={(e) =>
                  setSubInput({ ...subInput, [i]: e.target.value })
                }
                placeholder="Adicionar subtema"
                className="flex-1 border border-gray-300 rounded-lg p-2"
              />
              <button
                onClick={() => addSubtheme(i)}
                className="bg-green-600 text-white px-3 rounded-lg"
              >
                +
              </button>
            </div>

            {/* Lista de subtemas */}
            {t.subthemes.length > 0 && (
              <ul className="ml-3 list-disc text-gray-700">
                {t.subthemes.map((s, j) => (
                  <li key={j} className="flex justify-between items-center">
                    <span>{s.name}</span>
                    <button
                      onClick={() => removeSubtheme(i, j)}
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

      {/* Botão iniciar entrevista */}
      {themes.length > 0 && (
        <button
          onClick={startInterview}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          Iniciar Entrevista
        </button>
      )}
    </main>
  );
}
