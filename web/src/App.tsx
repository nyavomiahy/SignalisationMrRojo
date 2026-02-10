import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MapView from "./components/MapView";
import Dashboard from "./pages/Dashboard";
import ImagePage from "./pages/Image";

import GestionCompte from "./pages/GestionCompte";
import GestionCompteBloque from "./pages/GestionCompteBloque";
import ParametrePrix from "./pages/ParametrePrix";
import UserEdit from "./pages/UserEdit";
import { useState } from "react";


function App() {
  // On récupère l'état depuis le localStorage si disponible
  const [isLogged, setIsLogged] = useState(() => {
    return localStorage.getItem("isLogged") === "true";
  });

  const handleLoginSuccess = () => {
    setIsLogged(true);
    localStorage.setItem("isLogged", "true");
  };

  const handleLogout = () => {
    setIsLogged(false);
    localStorage.removeItem("isLogged");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<MapView onLoginSuccess={() => setIsLogged(true)} />}
        />
          <Route path="/image/:idPoint" element={<ImagePage />} />
        <Route path="/" element={<MapView onLoginSuccess={handleLoginSuccess} />} />
        <Route
          path="/dashboard"
          element={isLogged ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/gestion-compte"
          element={isLogged ? <GestionCompte /> : <Navigate to="/" replace />}
        />
        <Route
          path="/users/edit/:id"
          element={isLogged ? <UserEdit /> : <Navigate to="/" replace />}
        />
        <Route
          path="/gestion-compte-bloque"
          element={<GestionCompteBloque />}
          path="/parametre_prix"
          element={isLogged ? <ParametrePrix /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
