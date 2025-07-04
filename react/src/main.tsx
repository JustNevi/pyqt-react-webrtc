import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";

import WebRTCView from "./Components/WebRTC/WebRTCView.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WebRTCView />
  </StrictMode>
);
