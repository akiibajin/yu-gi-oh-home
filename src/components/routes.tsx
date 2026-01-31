import { LocationProvider, Route, Router } from "preact-iso";
import Home from "@/pages/home";

function Routes() {
	return (
		<LocationProvider>
			<Router>
				<Route path="/" component={Home} />
			</Router>
		</LocationProvider>
	);
}

export default Routes;
