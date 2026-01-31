// import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
// import { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import "leaflet/dist/leaflet.css";
// import "./MapView.css";

// import L from "leaflet";
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// import { useNavigate } from "react-router-dom";

// const DefaultIcon = L.icon({
//   iconUrl: markerIcon,
//   iconRetinaUrl: markerIcon2x,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// L.Marker.prototype.options.icon = DefaultIcon;

// type Point = {
//   id_point: number;
//   latitude: string;
//   longitude: string;
//   surface: number;
//   budget: number;
//   nameplace: string;
//   name_entreprise: string;
//   status?: string | null;
// };

// type Props = {
//   onLoginSuccess: () => void;
// };

// function MapView({ onLoginSuccess }: Props) {
//   const [points, setPoints] = useState<Point[]>([]);
//   const [position, setPosition] = useState<[number, number] | null>(null);
//   const [isRecapOpen, setIsRecapOpen] = useState(false);

//   // ===== AJOUT LOGIN =====
//   const [isLoginOpen, setIsLoginOpen] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const navigate = useNavigate(); // <-- redirection

//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition((pos) => {
//       setPosition([pos.coords.latitude, pos.coords.longitude]);
//     });

//     axios.get("http://localhost:5000/api/points")
//       .then((res) => setPoints(res.data))
//       .catch((err) => console.error(err));
//   }, []);

//   const getStatusOfPoint = (status: string | undefined | null) => {
//     if (!status) return "Aucun status";
//     if (status === "1") return "Nouveau";
//     if (status === "11") return "En cours";
//     if (status === "21") return "Terminé";
//     return "Inconnu";
//   };



//   const recap = useMemo(() => {
//     const totalSurface = points.reduce((acc, p) => acc + Number(p.surface), 0);
//     const totalBudget = points.reduce((acc, p) => acc + Number(p.budget), 0);
//     const nombrePoints = points.length;
//     const avancement = 100; // parce qu'on affiche tous les points

//     return { nombrePoints, totalSurface, totalBudget, avancement };
//   }, [points]);




//   // ===== FONCTION LOGIN =====
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       await axios.post("http://localhost:5000/api/auth/login", {
//         email,
//         password,
//       });

//       // pas de popup
//       setIsLoginOpen(false);

//       // redirection directe
//       onLoginSuccess();
//       navigate("/dashboard");
//     } catch (err: any) {
//       alert(err.response.data.error);
//     }
//   };

//   if (!position) return <p>Localisation en cours...</p>;

//   return (
//     <div style={{ height: "200vh", width: "100%", position: "relative" }}>

//       {/* ===== BOUTON LOGIN ===== */}
//       <button
//         onClick={() => setIsLoginOpen(true)}
//         style={{
//           position: "absolute",
//           top: 100,
//           left: 1300,
//           zIndex: 1000,
//           padding: "14px 24px",
//           backgroundColor: "#1d4ed8",
//           color: "white",
//           border: "none",
//           borderRadius: 12,
//           cursor: "pointer",
//           fontWeight: 700,
//           fontSize: "16px",
//           boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
//           transition: "transform 0.2s ease, background-color 0.2s ease",
//         }}
//         className="loginButton"
//       >
//         Login
//       </button>

//       {/* Bouton récapitulatif */}
//       <button
//         onClick={() => setIsRecapOpen(true)}
//         style={{
//           position: "absolute",
//           top: 20,
//           left: 1300,
//           zIndex: 1000,
//           padding: "14px 24px",
//           backgroundColor: "#1d4ed8",
//           color: "white",
//           border: "none",
//           borderRadius: 12,
//           cursor: "pointer",
//           fontWeight: 700,
//           fontSize: "16px",
//           boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
//           transition: "transform 0.2s ease, background-color 0.2s ease",
//         }}
//         onMouseEnter={(e) => {
//           (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
//           (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2563eb";
//         }}
//         onMouseLeave={(e) => {
//           (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
//           (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8";
//         }}
//       >
//         Récapitulatif
//       </button>

//       <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//         {points.map((p) => (
//           <Marker key={p.id_point} position={[parseFloat(p.latitude), parseFloat(p.longitude)]}>
//             <Tooltip direction="top" offset={[0, -10]} opacity={1} className="customTooltip">
//               <div>
//                 <b>{p.nameplace}</b>
//                 <span>Surface: {p.surface} m²</span>
//                 <span>Budget: {p.budget} Ariary</span>
//                 <span>Entreprise: {p.name_entreprise}</span>
//                 <span>Status: <b>{getStatusOfPoint(p.status)}</b></span>
//               </div>
//             </Tooltip>

//           </Marker>
//         ))}
//       </MapContainer>

//       {/* ===== MODAL LOGIN ===== */}
//       {isLoginOpen && (
//         <div className="modalOverlay">
//           <div className="modalContent">
//             <h2>Login</h2>
//             <form onSubmit={handleLogin}>
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//               <input
//                 type="password"
//                 placeholder="Mot de passe"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <button type="submit">Se connecter</button>
//             </form>
//             <button className="closeBtn" onClick={() => setIsLoginOpen(false)}>
//               Fermer
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Modal récapitulatif */}
//       {isRecapOpen && (
//         <div className="modalOverlay">
//           <div className="modalContent">
//             <h2>Récapitulatif</h2>

//             <table>
//               <thead>
//                 <tr>
//                   <th>Nombre de points</th>
//                   <th>Total surface</th>
//                   <th>Avancement</th>
//                   <th>Total budget</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td>{recap.nombrePoints}</td>
//                   <td>{recap.totalSurface} m²</td>
//                   <td>{recap.avancement} %</td>
//                   <td>{recap.totalBudget} Ariary</td>
//                 </tr>
//               </tbody>
//             </table>

//             <button onClick={() => setIsRecapOpen(false)}>Fermer</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MapView;

import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { useNavigate } from "react-router-dom";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type Point = {
  id_point: number;
  latitude: string;
  longitude: string;
  surface: number;
  budget: number;
  nameplace: string;
  name_entreprise: string;
  status?: string | null;
};

type StatusPoint = {
  id_point: number;
  status: string;
};

type Props = {
  onLoginSuccess: () => void;
};

function MapView({ onLoginSuccess }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const [statusList, setStatusList] = useState<StatusPoint[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isRecapOpen, setIsRecapOpen] = useState(false);

  // ===== AJOUT LOGIN =====
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });

    // 🔥 1) points
    axios.get("http://localhost:5000/api/points")
      .then((res) => setPoints(res.data))
      .catch((err) => console.error(err));

    // 🔥 2) status points
    axios.get("http://localhost:5000/api/status_point")
      .then((res) => setStatusList(res.data))
      .catch((err) => console.error(err));
  }, []);

  //const handleSync = async () => {
  //  try {
  //    await axios.post("http://localhost:5000/api/firestore-to-postgres/postgres-to-firebase-users");
//
  //    alert("Synchronisation réussie ✅");
//
  //    // recharger les points après sync
  //    const res = await axios.get("http://localhost:5000/api/points");
  //    setPoints(res.data);
//
  //  } catch (err: any) {
  //    alert("Erreur de synchronisation ❌");
  //    console.error(err);
  //  }
  //};
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
          alert(`Synchronisation ${api.name} en cours... ⏳`);
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

  const getProgressFromStatus = (status: string | undefined | null): number => {
    if (status == "1") return 0;
    if (status == "11") return 50;
    if (status == "21") return 100;
    return 0;
  };

  // 🔥 Fusion points + status
  const pointsWithStatus = useMemo(() => {
    return points.map((p) => {
      const st = statusList.find((s) => s.id_point === p.id_point);
      return {
        ...p,
        status: st ? st.status : "1",
      };
    });
  }, [points, statusList]);

  const recap = useMemo(() => {
    const totalSurface = pointsWithStatus.reduce(
      (acc, p) => acc + Number(p.surface),
      0
    );

    const totalBudget = pointsWithStatus.reduce(
      (acc, p) => acc + Number(p.budget),
      0
    );

    const nombrePoints = pointsWithStatus.length;

    const totalProgress = pointsWithStatus.reduce((acc, p) => {
      return acc + getProgressFromStatus(p.status);
    }, 0);

    const avancement =
      nombrePoints > 0 ? totalProgress / nombrePoints : 0;

    return {
      nombrePoints,
      totalSurface,
      totalBudget,
      avancement: Math.round(avancement),
    };
  }, [pointsWithStatus]);

  // ===== FONCTION LOGIN =====
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      setIsLoginOpen(false);
      onLoginSuccess();
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response.data.error);
    }
  };

  if (!position) return <p>Localisation en cours...</p>;

  return (
    <div style={{ height: "200vh", width: "100%", position: "relative" }}>

      {/* ===== BOUTON LOGIN ===== */}
      <button
        onClick={() => setIsLoginOpen(true)}
        style={{
          position: "absolute",
          top: 100,
          left: 1300,
          zIndex: 1000,
          padding: "14px 24px",
          backgroundColor: "#1d4ed8",
          color: "white",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "16px",
          boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
          transition: "transform 0.2s ease, background-color 0.2s ease",
        }}
        className="loginButton"
      >
        Login
      </button>
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

      {/* Bouton récapitulatif */}
      <button
        onClick={() => setIsRecapOpen(true)}
        style={{
          position: "absolute",
          top: 20,
          left: 1300,
          zIndex: 1000,
          padding: "14px 24px",
          backgroundColor: "#1d4ed8",
          color: "white",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "16px",
          boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
          transition: "transform 0.2s ease, background-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2563eb";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8";
        }}
      >
        Récapitulatif
      </button>

      <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {pointsWithStatus.map((p) => (
          <Marker key={p.id_point} position={[parseFloat(p.latitude), parseFloat(p.longitude)]}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="customTooltip">
              <div>
                <b>{p.nameplace}</b>
                <span>Surface: {p.surface} m²</span>
                <span>Budget: {p.budget} Ariary</span>
                <span>Entreprise: {p.name_entreprise}</span>
                <span>Status: <b>{getStatusOfPoint(p.status)}</b></span>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* ===== MODAL LOGIN ===== */}
      {isLoginOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Se connecter</button>
            </form>
            <button className="closeBtn" onClick={() => setIsLoginOpen(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal récapitulatif */}
      {isRecapOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>Récapitulatif</h2>

            <table>
              <thead>
                <tr>
                  <th>Nombre de points</th>
                  <th>Total surface</th>
                  <th>Avancement</th>
                  <th>Total budget</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{recap.nombrePoints}</td>
                  <td>{recap.totalSurface} m²</td>
                  <td>{recap.avancement} %</td>
                  <td>{recap.totalBudget} Ariary</td>
                </tr>
              </tbody>
            </table>

            <button onClick={() => setIsRecapOpen(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;
