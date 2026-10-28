import "./App.css";
import AppRoutes from "@/components/app-routes"
import { useZoom } from "@/hooks/use-zoom";

function App() {
  useZoom();
  return <AppRoutes />;
}

export default App;
