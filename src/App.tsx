import "./App.css";
import Layout from "@/components/layout";
import Routes from "./components/routes";
import { LocationProvider } from "preact-iso";
import { useZoom } from "@/hooks/use-zoom";
import UpdateNotification from "@/components/update-notification";

function App() {
	useZoom();
	return (
		<LocationProvider>
			<Layout>
				<Routes />
			</Layout>
			<UpdateNotification />
		</LocationProvider>
	);
}

export default App;
