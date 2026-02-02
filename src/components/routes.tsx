import { Route, Router } from "preact-iso";
import Home from "@/pages/home";
import CalcHome from "@/pages/calc/home";
import Calc from "@/pages/calc";
import CalcSetup from "@/pages/calc/setup";
import CardMaker from "@/pages/card-maker";

function Routes() {
	return (
		<Router>
			{[
				<Route key="home" path="/" component={Home} />,
				<Route key="calc-home" path="/calc" component={CalcHome} />,
				<Route
					key="calc-setup"
					path="/calc/:num/setup"
					component={CalcSetup}
				/>,
				<Route key="calc" path="/calc/:num" component={Calc} />,
				<Route key="card-maker" path="/card-maker" component={CardMaker} />,
			]}
		</Router>
	);
}

export default Routes;
