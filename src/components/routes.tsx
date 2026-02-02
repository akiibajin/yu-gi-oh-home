import { Route, Router } from "preact-iso";
import Home from "@/pages/home";
import Calc from "@/pages/calc";
import CalcSetup from "@/pages/calc/setup";

function Routes() {
	return (
		<Router>
			{
				[
					<Route key="home" path="/" component={Home} />,
					<Route key="calc-setup" path="/calc/:num/setup" component={CalcSetup} />,
					<Route key="calc" path="/calc/:num" component={Calc} />,
				]
			}
		</Router>
	);
}

export default Routes;
