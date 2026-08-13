import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DetectInternet from "./utils/DetectInternet.jsx";

const queryClinet = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClinet}>
        <DetectInternet />
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
