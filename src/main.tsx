import { render } from "preact";
import App from "./App";
import "@/components/ui/warcraftcn/styles/warcraft.css";

const root = document.getElementById("root");
if (!root) {
	throw new Error('Root element with id "root" was not found.');
}

render(<App />, root);
