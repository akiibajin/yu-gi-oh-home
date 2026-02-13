import { Route, Router } from "preact-iso";
import Home from "@/pages/home";
import CalcHome from "@/pages/calc/home";
import Calc from "@/pages/calc";
import CalcSetup from "@/pages/calc/setup";
import CardMaker from "@/pages/card-maker";
import FieldsBg from "@/pages/fields-bg";
import CreateLobby from "@/pages/lobby/create";
import JoinLobby from "@/pages/lobby/join";
import HostDisplay from "@/pages/lobby/host-display";
import GuestControl from "@/pages/lobby/guest-control";
import LobbyIndex from "@/pages/lobby";

function Routes() {
	return (
		<Router
			onRouteChange={(url) => console.log("Route changed to", url)}
			onLoadStart={(url) => console.log("Starting to load", url)}
			onLoadEnd={(url) => console.log("Finished loading", url)}
		>
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
				<Route key="fields-bg" path="/fields-bg" component={FieldsBg} />,
				<Route key="lobby-home" path="/lobby" component={LobbyIndex} />,
				<Route
					key="lobby-create"
					path="/lobby/create"
					component={CreateLobby}
				/>,
				<Route key="lobby-join" path="/lobby/join" component={JoinLobby} />,
				<Route
					key="lobby-host"
					path="/lobby/host/:lobbyId"
					component={HostDisplay}
				/>,
				<Route
					key="lobby-guest"
					path="/lobby/guest/:lobbyId"
					component={GuestControl}
				/>,
			]}
		</Router>
	);
}

export default Routes;
