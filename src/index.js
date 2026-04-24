import { jsx as _jsx } from "react/jsx-runtime";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(_jsx(BrowserRouter, { children: _jsx(App, {}) }));
