import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { store } from "./app/store";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1b1f27",
              color: "#f3f4f6",
              border: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
