// Evita warnings desnecessários de "act(...)" nos testes
jest.spyOn(console, "error").mockImplementation((msg) => {
  if (!msg.toString().includes("act(...)")) console.error(msg);
});

// ✅ Valida que o ambiente de teste é jsdom (essencial para testes React DOM)
if (typeof window === "undefined" || typeof document === "undefined") {
  throw new Error("❌ Ambiente incorreto! Certifique-se de usar testEnvironment: 'jsdom' no jest.config.js");
}

// ✅ Mock de alert — evita erro "not implemented: window.alert"
if (typeof global.alert === "undefined") {
  global.alert = jest.fn();
}

// ✅ Mock do navigator.mediaDevices e getUserMedia
if (!global.navigator) {
  global.navigator = {};
}

if (!global.navigator.mediaDevices) {
  Object.defineProperty(global.navigator, "mediaDevices", {
    writable: true,
    value: {
      getUserMedia: jest.fn(() => Promise.resolve({})),
    },
  });
} else {
  // 🔁 Caso já exista (reexecução de testes em watch mode)
  global.navigator.mediaDevices.getUserMedia = jest.fn(() => Promise.resolve({}));
}

// ✅ Mock de MediaRecorder
if (typeof global.MediaRecorder === "undefined") {
  global.MediaRecorder = class {
    constructor() {
      this.state = "inactive";
      this.ondataavailable = null;
    }
    start() {
      this.state = "recording";
    }
    stop() {
      this.state = "inactive";
      if (this.ondataavailable) {
        this.ondataavailable({
          data: new Blob(["mock data"], { type: "audio/webm" }),
        });
      }
    }
  };
}

// 🔎 Valida se os mocks críticos estão ativos
beforeAll(() => {
  if (typeof global.alert !== "function") {
    throw new Error("❌ Mock de window.alert não foi configurado!");
  }
  if (!global.navigator.mediaDevices?.getUserMedia) {
    throw new Error("❌ Mock de navigator.mediaDevices.getUserMedia não foi configurado!");
  }
  if (typeof global.MediaRecorder === "undefined") {
    throw new Error("❌ Mock de MediaRecorder não foi configurado!");
  }
  console.log("✅ Mocks do navegador configurados com sucesso!");
});
