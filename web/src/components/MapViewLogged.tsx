import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* ================= ICON LEAFLET ================= */
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

/* ================= TYPES ================= */
type Point = {
  id_point: number;
  latitude: string;
  longitude: string;
  surface: number;
  budget: number;
  nameplace: string;
  name_entreprise: string;
  status?: string | null;
  daty?: string | null;
};

type TypeAccount = {
  id_type_account: number;
  name_type: string;
};

type Props = {
  onLogout: () => void;
};

/* ================= COMPONENT ================= */
function MapViewLogged({ onLogout }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);

  /* ===== inscription ===== */
  const [showRegister, setShowRegister] = useState(false);
  const [typesAccount, setTypesAccount] = useState<TypeAccount[]>([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    id_type_account: "",
  });

  /* ================= USE EFFECT ================= */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });

    fetchPoints();
  }, []);

  /* ================= API CALLS ================= */
  const fetchPoints = () => {
    axios
      .get("http://localhost:5000/api/points")
      .then((res) => setPoints(res.data))
      .catch((err) => console.error(err));
  };

  const fetchTypesAccount = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/type_account");
      setTypesAccount(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("Inscription réussie 🎉");
      setShowRegister(false);
      setForm({
        username: "",
        email: "",
        password: "",
        id_type_account: "",
      });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'inscription");
    }
  };

  const handleDeletePoint = async (id_point: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/points/${id_point}`);
      fetchPoints();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id_point: number, newStatus: string) => {
    try {
      await axios.post("http://localhost:5000/api/status_point", {
        id_point,
        status: newStatus,
        daty: new Date().toISOString().split("T")[0],
      });
      fetchPoints();
    } catch (err) {
      console.error(err);
    }
  };

  // const handleSync = async () => {
  //   try {
  //     const res = await axios.post("http://localhost:5000/api/sync");
  //     alert(res.data.message);
  //     fetchPoints(); // Rafraîchir les points depuis Postgres après sync
  //   } catch (err) {
  //     console.error(err);
  //     alert("Erreur de synchronisation");
  //   }
  // };

  const handleSync = async () => {
    try {
      const apis = [
        { name: "Utilisateurs", url: "http://localhost:5000/api/firestore-to-postgres/postgres-to-firebase-users" },
        { name: "Générale", url: "http://localhost:5000/api/firestore-to-postgres/postgres-to-firebase" },
        { name: "Firebase → PostgreSQL", url: "http://localhost:5000/api/firestore-to-postgres/" }
      ];
  
      const results = [];
  
      for (const api of apis) {
        try {
          alert(`Debut de la synchronisation appuyer pour synchorniser  ${api.name} en cours... attender environ 2 min pour la synchronisation ⏳`);
          const response = await axios.post(api.url);
          results.push({ name: api.name, success: true, data: response.data });
          console.log(`✅ ${api.name} synchronisé`);
        } catch (error) {
          results.push({ name: api.name, success: false, error: error.message });
          console.error(`❌ ${api.name} échoué:`, error.message);
        }
      }
  
      // Afficher le résumé
      const successfulCount = results.filter(r => r.success).length;
      alert(`Synchronisation terminée!\n\nSuccès: ${successfulCount}/3\nÉchecs: ${3 - successfulCount}`);
  
      // Recharger les points
      const res = await axios.get("http://localhost:5000/api/points");
      setPoints(res.data);
  
    } catch (err: any) {
      alert("Erreur de synchronisation ❌");
      console.error(err);
    }
  };

  const getStatusOfPoint = (status: string | undefined | null) => {
    if (!status) return "Aucun status";
    if (status === "1") return "Nouveau";
    if (status === "11") return "En cours";
    if (status === "21") return "Terminé";
    return "Inconnu";
  };

  if (!position) return <p>Localisation en cours...</p>;

  /* ================= RENDER ================= */
  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* ===== BUTTON INSCRIPTION ===== */}
      <button
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 1000,
          padding: "14px 24px",
          backgroundColor: "#10b981",
          color: "white",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: 700,
        }}
        onClick={() => {
          setShowRegister(true);
          fetchTypesAccount();
        }}
      >
        Inscription
      </button>

      {/* ===== BUTTON LOGOUT ===== */}
      <button
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 1000,
          padding: "14px 24px",
          backgroundColor: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: 700,
        }}
        onClick={onLogout}
      >
        Déconnexion
      </button>

      {/* ===== BUTTON SYNCHRONISER (jaune) ===== */}
      <button
        onClick={handleSync}
        style={{
          position: "absolute",
          top: 180,
          left: 1300,
          zIndex: 1000,
          padding: "14px 24px",
          backgroundColor: "#059669",
          color: "white",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "16px",
          boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
        }}
      >
        Synchroniser
      </button>

      {/* ===== MODAL INSCRIPTION ===== */}
      {showRegister && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 2000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 30,
              borderRadius: 16,
              width: 360,
            }}
          >
            <h2>Inscription</h2>

            <input
              placeholder="Nom d'utilisateur"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10 }}
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: "100%", marginBottom: 10 }}
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              style={{ width: "100%", marginBottom: 10 }}
            />

            <select
              value={form.id_type_account}
              onChange={(e) =>
                setForm({ ...form, id_type_account: e.target.value })
              }
              style={{ width: "100%", marginBottom: 15 }}
            >
              <option value="">-- Type de compte --</option>
              {typesAccount.map((t) => (
                <option key={t.id_type_account} value={t.id_type_account}>
                  {t.name_type}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setShowRegister(false)}>Annuler</button>
              <button onClick={handleRegister}>S'inscrire</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MAP ===== */}
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {points.map((p) => (
          <Marker
            key={p.id_point}
            position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
          >
            <Popup>
              <div>
                <h3>{p.nameplace}</h3>
                <p>Surface : {p.surface} m²</p>
                <p>Budget : {p.budget} Ariary</p>
                <p>Entreprise : {p.name_entreprise}</p>
                <p>
                  Status : <b>{getStatusOfPoint(p.status)}</b>
                </p>

                <hr />

                <button onClick={() => handleDeletePoint(p.id_point)}>
                  Supprimer
                </button>

                <button
                  onClick={() => handleUpdateStatus(p.id_point, "11")}
                >
                  Mettre en cours
                </button>

                <button
                  onClick={() => handleUpdateStatus(p.id_point, "21")}
                >
                  Terminé
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapViewLogged;
