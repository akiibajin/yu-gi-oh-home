import "./App.css";
import Layout from "@/components/layout";
import Routes from "./components/routes";
import { LocationProvider } from "preact-iso";
import { useEffect } from "preact/hooks";
import { initSupabaseConfigFromEnv } from "@/lib/tauri/supabase-config";
import { initDatabaseUrlFromEnv } from "@/lib/tauri/db-config";

function App() {
	useEffect(() => {
		void initDatabaseUrlFromEnv();
		void initSupabaseConfigFromEnv();
	}, []);

	return (
		<LocationProvider>
			<Layout>
				<Routes />
			</Layout>
		</LocationProvider>
	);
}

export default App;
