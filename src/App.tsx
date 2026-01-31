import { LocationProvider, Route, Router } from "preact-iso";
import Home from "@/pages/home";
import "./App.css";

function App() {

  return (
    <LocationProvider>
      <Router>
        <Route path="/" component={Home} />
      </Router>
    </LocationProvider>
  );
}

export default App;
