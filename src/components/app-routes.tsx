import { Route, Routes } from "react-router";
import Layout from "./layout";

import Home from "@/pages/home"
import CalcHome from "@/pages/calc/home"
import Calc from "@/pages/calc"
import CalcSetup from "@/pages/calc/setup"
import CardMaker from "@/pages/card-maker"
import CreateLobby from "@/pages/lobby/create"
import JoinLobby from "@/pages/lobby/join"
import HostDisplay from "@/pages/lobby/host-display"
import GuestControl from "@/pages/lobby/guest-control"
import LobbyIndex from "@/pages/lobby"

function AppRoutes() {
  return (
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home/>} />,
          <Route path="calc" element={<CalcHome/>} />,
          <Route path="calc/:num/setup" element={<CalcSetup />} />,
          <Route path="calc/:num" element={<Calc />} />,
          <Route path="card-maker" element={<CardMaker />} />,
          <Route path="lobby" element={<LobbyIndex />} />,
          <Route path="lobby/create" element={<CreateLobby />} />,
          <Route path="lobby/join" element={<JoinLobby />} />,
          <Route path="lobby/host/:lobbyId" element={<HostDisplay />} />,
          <Route path="lobby/guest/:lobbyId" element={<GuestControl />} />
        </Route>
      </Routes>
  );
}

export default AppRoutes;
