// ==============================
// main.tsx — Ponto de entrada da aplicação React
// Responsável por montar o componente raiz (<App />) no DOM do navegador
// Este arquivo é referenciado pelo index.html como script principal (type="module")
// ==============================

import { createRoot } from "react-dom/client"; // API moderna do React 18 para renderização — substitui ReactDOM.render()
import App from "./App.tsx";                    // Componente raiz que contém roteamento e provedores globais
import "./index.css";                           // Importa os estilos globais (Tailwind + variáveis de tema + fonte Nunito)

// Monta a aplicação React no elemento HTML com id="root" (definido em index.html)
// O operador "!" (non-null assertion) garante ao TypeScript que o elemento existe
createRoot(document.getElementById("root")!).render(<App />);