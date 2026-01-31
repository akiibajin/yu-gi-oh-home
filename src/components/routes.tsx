import { Route, Router } from "preact-iso";
import Home from "@/pages/home";

function Routes() {
	return (
		<Router>
			{[<Route key="home" path="/" component={Home} />]}
		</Router>
	);
}

export default Routes;
