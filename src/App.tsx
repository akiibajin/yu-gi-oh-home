import "./App.css";
import Layout from "@/components/layout";
import Routes from "./components/routes";
import { LocationProvider } from "preact-iso";

function App() {
	return (
		<LocationProvider>
			<Layout>
				<Routes />
			</Layout>
		</LocationProvider>
	);
}

export default App;
