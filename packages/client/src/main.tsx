/**
 * Application entry point - initializes and renders React app to DOM.
 * Uses React 18's createRoot API for concurrent rendering.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from './App';
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App/>
  </StrictMode>,
);
