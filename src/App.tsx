import "./App.css";
import Layout from "@/components/layout";
import Routes from "./components/routes";
import { LocationProvider } from "preact-iso";
import { useZoom } from "@/hooks/use-zoom";

function App() {
	useZoom();
	return (
		<LocationProvider>
			<Layout>
				<Routes />
			</Layout>
		</LocationProvider>
	);
}

export default App;
