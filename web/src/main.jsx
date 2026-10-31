import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import { getSteps } from "./python.js";
getSteps("Jarvis march", [
  [0, 0],
  [4, 0],
  [4, 4],
  [0, 4],
  [2, 2],
]).then((steps) => console.log(steps));
