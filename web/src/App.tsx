import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MapView from "./components/MapView";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";

function App() {
  const [isLogged, setIsLogged] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<MapView onLoginSuccess={() => setIsLogged(true)} />}
        />
        <Route
          path="/dashboard"
          element={
            isLogged ? (
              <Dashboard onLogout={() => setIsLogged(false)} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
