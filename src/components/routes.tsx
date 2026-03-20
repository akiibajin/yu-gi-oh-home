import { Route, Router } from "preact-iso";
import { Suspense } from "preact/compat";
import lazy from "preact-iso/lazy";

const Home = lazy(() => import("@/pages/home"));
const CalcHome = lazy(() => import("@/pages/calc/home"));
const Calc = lazy(() => import("@/pages/calc"));
const CalcSetup = lazy(() => import("@/pages/calc/setup"));
const CardMaker = lazy(() => import("@/pages/card-maker"));
const CreateLobby = lazy(() => import("@/pages/lobby/create"));
const JoinLobby = lazy(() => import("@/pages/lobby/join"));
const HostDisplay = lazy(() => import("@/pages/lobby/host-display"));
const GuestControl = lazy(() => import("@/pages/lobby/guest-control"));
const LobbyIndex = lazy(() => import("@/pages/lobby"));

function Routes() {
	const isDev = import.meta.env.DEV;
	return (
		<Suspense
			fallback={
				<div className="flex size-full flex-1 items-center justify-center p-4">
					Loading
				</div>
			}
		>
			<Router
				onRouteChange={
					isDev ? (url) => console.log("Route changed to", url) : undefined
				}
				onLoadStart={
					isDev ? (url) => console.log("Starting to load", url) : undefined
				}
				onLoadEnd={
					isDev ? (url) => console.log("Finished loading", url) : undefined
				}
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
		</Suspense>
	);
}

export default Routes;
