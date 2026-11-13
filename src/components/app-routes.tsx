import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes } from "react-router";
import Layout from "./layout";

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

function RoutePage({ children }: { children: ReactNode }) {
	return (
		<Suspense
			fallback={
				<div className="flex flex-1 items-center justify-center" role="status">
					Loading…
				</div>
			}
		>
			{children}
		</Suspense>
	);
}

function AppRoutes() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route index element={<RoutePage><Home /></RoutePage>} />
				<Route path="calc" element={<RoutePage><CalcHome /></RoutePage>} />
				<Route path="calc/:num/setup" element={<RoutePage><CalcSetup /></RoutePage>} />
				<Route path="calc/:num" element={<RoutePage><Calc /></RoutePage>} />
				<Route path="card-maker" element={<RoutePage><CardMaker /></RoutePage>} />
				<Route path="lobby" element={<RoutePage><LobbyIndex /></RoutePage>} />
				<Route path="lobby/create" element={<RoutePage><CreateLobby /></RoutePage>} />
				<Route path="lobby/join" element={<RoutePage><JoinLobby /></RoutePage>} />
				<Route
					path="lobby/host/:lobbyId"
					element={<RoutePage><HostDisplay /></RoutePage>}
				/>
				<Route
					path="lobby/guest/:lobbyId"
					element={<RoutePage><GuestControl /></RoutePage>}
				/>
			</Route>
		</Routes>
	);
}

export default AppRoutes;
