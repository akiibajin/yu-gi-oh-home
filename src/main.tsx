import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "@/components/ui/warcraftcn/styles/warcraft.css";

const root = document.getElementById("root");
if (!root) {
	throw new Error('Root element with id "root" was not found.');
}

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
