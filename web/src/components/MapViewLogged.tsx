// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import "leaflet/dist/leaflet.css";
// import "./MapView.css";

// import L from "leaflet";
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// /* ================= ICON LEAFLET ================= */
// const DefaultIcon = L.icon({
//   iconUrl: markerIcon,
//   iconRetinaUrl: markerIcon2x,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// L.Marker.prototype.options.icon = DefaultIcon;

// /* ================= TYPES ================= */
// type Point = {
//   id_point: number;
//   latitude: string;
//   longitude: string;
//   surface: number;
//   budget: number;
//   nameplace: string;
//   name_entreprise: string;
//   status?: string | null;
//   daty?: string | null;
// };

// type TypeAccount = {
//   id_type_account: number;
//   name_type: string;
// };

// type Props = {
//   onLogout: () => void;
// };

// /* ================= COMPONENT ================= */
// function MapViewLogged({ onLogout }: Props) {
//   const [points, setPoints] = useState<Point[]>([]);
//   const [position, setPosition] = useState<[number, number] | null>(null);

//   /* ===== inscription ===== */
//   const [showRegister, setShowRegister] = useState(false);
//   const [typesAccount, setTypesAccount] = useState<TypeAccount[]>([]);
//   const [form, setForm] = useState({
//     username: "",
//     email: "",
//     password: "",
//     id_type_account: "",
//   });

//   /* ================= USE EFFECT ================= */
//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition((pos) => {
//       setPosition([pos.coords.latitude, pos.coords.longitude]);
//     });

//     fetchPoints();
//   }, []);

//   /* ================= API CALLS ================= */
//   const fetchPoints = () => {
//     axios
//       .get("http://localhost:5000/api/points")
//       .then((res) => setPoints(res.data))
//       .catch((err) => console.error(err));
//   };

//   const fetchTypesAccount = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/type_account");
//       setTypesAccount(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleRegister = async () => {
//     try {
//       await axios.post("http://localhost:5000/api/auth/register", form);
//       alert("Inscription réussie 🎉");
//       setShowRegister(false);
//       setForm({
//         username: "",
//         email: "",
//         password: "",
//         id_type_account: "",
//       });
//     } catch (err) {
//       console.error(err);
//       alert("Erreur lors de l'inscription");
//     }
//   };

//   const handleDeletePoint = async (id_point: number) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/points/${id_point}`);
//       fetchPoints();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleUpdateStatus = async (id_point: number, newStatus: string) => {
//     try {
//       await axios.post("http://localhost:5000/api/status_point", {
//         id_point,
//         status: newStatus,
//         daty: new Date().toISOString().split("T")[0],
//       });
//       fetchPoints();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleSync = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/api/sync");
//       alert(res.data.message);
//       fetchPoints(); // Rafraîchir les points depuis Postgres après sync
//     } catch (err) {
//       console.error(err);
//       alert("Erreur de synchronisation");
//     }
//   };

//   const getStatusOfPoint = (status: string | undefined | null) => {
//     if (!status) return "Aucun status";
//     if (status === "1") return "Nouveau";
//     if (status === "11") return "En cours";
//     if (status === "21") return "Terminé";
//     return "Inconnu";
//   };

//   if (!position) return <p>Localisation en cours...</p>;

//   /* ================= RENDER ================= */
//   return (
//     <div style={{ height: "100vh", width: "100%", position: "relative", fontFamily: 'Inter, Arial, sans-serif', background: '#f4f6fa' }}>
//       {/* ===== BUTTON INSCRIPTION ===== */}
//       <button
//         style={{
//           position: "absolute",
//           top: 20,
//           left: 20,
//           zIndex: 1000,
//           padding: "14px 28px",
//           background: "linear-gradient(90deg,#10b981 60%,#34d399 100%)",
//           color: "white",
//           border: "none",
//           borderRadius: 16,
//           cursor: "pointer",
//           fontWeight: 700,
//           fontSize: "17px",
//           boxShadow: "0 4px 16px rgba(16,185,129,0.15)",
//           transition: "background 0.2s, transform 0.15s",
//         }}
//         onMouseOver={e => e.currentTarget.style.background = '#059669'}
//         onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg,#10b981 60%,#34d399 100%)'}
//         onClick={() => {
//           setShowRegister(true);
//           fetchTypesAccount();
//         }}
//       >
//         Inscription
//       </button>

//       {/* ===== BUTTON LOGOUT ===== */}
//       <button
//         style={{
//           position: "absolute",
//           top: 20,
//           right: 20,
//           zIndex: 1000,
//           padding: "14px 28px",
//           background: "linear-gradient(90deg,#ef4444 60%,#f87171 100%)",
//           color: "white",
//           border: "none",
//           borderRadius: 16,
//           cursor: "pointer",
//           fontWeight: 700,
//           fontSize: "17px",
//           boxShadow: "0 4px 16px rgba(239,68,68,0.15)",
//           transition: "background 0.2s, transform 0.15s",
//         }}
//         onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
//         onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg,#ef4444 60%,#f87171 100%)'}
//         onClick={onLogout}
//       >
//         Déconnexion
//       </button>

//       {/* ===== BUTTON SYNCHRONISER (jaune) ===== */}
//       <button
//         onClick={handleSync}
//         style={{
//           position: "absolute",
//           top: 80,
//           right: 20,
//           zIndex: 1000,
//           padding: "14px 28px",
//           background: "linear-gradient(90deg,#facc15 60%,#fde68a 100%)",
//           color: "#333",
//           border: "none",
//           borderRadius: 16,
//           cursor: "pointer",
//           fontWeight: 700,
//           fontSize: "17px",
//           boxShadow: "0 4px 16px rgba(250,204,21,0.15)",
//           transition: "background 0.2s, transform 0.15s",
//         }}
//         onMouseOver={e => e.currentTarget.style.background = '#eab308'}
//         onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg,#facc15 60%,#fde68a 100%)'}
//       >
//         🔄 Synchroniser
//       </button>

//       {/* ===== MODAL INSCRIPTION ===== */}
//       {showRegister && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             backgroundColor: "rgba(0,0,0,0.45)",
//             zIndex: 2000,
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             animation: 'fadeIn 0.2s',
//           }}
//         >
//           <div
//             style={{
//               background: "#fff",
//               padding: 36,
//               borderRadius: 20,
//               width: 370,
//               boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
//               display: 'flex',
//               flexDirection: 'column',
//               gap: 10,
//             }}
//           >
//             <h2 style={{marginBottom: 18, color: '#059669'}}>Inscription</h2>

//             <input
//               placeholder="Nom d'utilisateur"
//               value={form.username}
//               onChange={(e) => setForm({ ...form, username: e.target.value })}
//               style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15 }}
//             />

//             <input
//               placeholder="Email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15 }}
//             />

//             <input
//               type="password"
//               placeholder="Mot de passe"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15 }}
//             />

//             <select
//               value={form.id_type_account}
//               onChange={(e) => setForm({ ...form, id_type_account: e.target.value })}
//               style={{ width: "100%", marginBottom: 18, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 15, background: '#f9fafb' }}
//             >
//               <option value="">-- Type de compte --</option>
//               {typesAccount.map((t) => (
//                 <option key={t.id_type_account} value={t.id_type_account}>
//                   {t.name_type}
//                 </option>
//               ))}
//             </select>

//             <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
//               <button
//                 onClick={() => setShowRegister(false)}
//                 style={{
//                   background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
//                 }}
//                 onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
//                 onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
//               >Annuler</button>
//               <button
//                 onClick={handleRegister}
//                 style={{
//                   background: 'linear-gradient(90deg,#10b981 60%,#34d399 100%)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s',
//                 }}
//                 onMouseOver={e => e.currentTarget.style.background = '#059669'}
//                 onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg,#10b981 60%,#34d399 100%)'}
//               >S'inscrire</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ===== MAP ===== */}
//       <MapContainer
//         center={position}
//         zoom={13}
//         style={{ height: "100%", width: "100%", borderRadius: 18, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
//       >
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//         {points.map((p) => (
//           <Marker
//             key={p.id_point}
//             position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
//           >
//             <Popup>
//               <div style={{minWidth:180}}>
//                 <h3 style={{marginBottom:6, color:'#059669'}}>{p.nameplace}</h3>
//                 <p style={{margin:0, fontSize:14}}>Surface : <b>{p.surface} m²</b></p>
//                 <p style={{margin:0, fontSize:14}}>Budget : <b>{p.budget} Ariary</b></p>
//                 <p style={{margin:0, fontSize:14}}>Entreprise : <b>{p.name_entreprise}</b></p>
//                 <p style={{margin:0, fontSize:14}}>Status : <b>{getStatusOfPoint(p.status)}</b></p>
//                 <hr style={{margin:'10px 0'}}/>
//                 <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
//                   <button onClick={() => handleDeletePoint(p.id_point)} style={{background:'#ef4444', color:'white', border:'none', borderRadius:7, padding:'7px 13px', fontWeight:600, cursor:'pointer', fontSize:13, transition:'background 0.2s'}} onMouseOver={e=>e.currentTarget.style.background='#dc2626'} onMouseOut={e=>e.currentTarget.style.background='#ef4444'}>Supprimer</button>
//                   <button onClick={() => handleUpdateStatus(p.id_point, "11")} style={{background:'#facc15', color:'#333', border:'none', borderRadius:7, padding:'7px 13px', fontWeight:600, cursor:'pointer', fontSize:13, transition:'background 0.2s'}} onMouseOver={e=>e.currentTarget.style.background='#eab308'} onMouseOut={e=>e.currentTarget.style.background='#facc15'}>Mettre en cours</button>
//                   <button onClick={() => handleUpdateStatus(p.id_point, "21")} style={{background:'#10b981', color:'white', border:'none', borderRadius:7, padding:'7px 13px', fontWeight:600, cursor:'pointer', fontSize:13, transition:'background 0.2s'}} onMouseOver={e=>e.currentTarget.style.background='#059669'} onMouseOut={e=>e.currentTarget.style.background='#10b981'}>Terminé</button>
//                 </div>
//               </div>
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }

// export default MapViewLogged;

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";

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
      //   { name: "Utilisateurs", url: "http://localhost:5000/api/firestore-to-postgres/postgres-to-firebase-users" },
      //   { name: "postgres -> firebase", url: "http://localhost:5000/api/firestore-to-postgres/postgres-to-firebase" },
      //   { name: "Firebase → PostgreSQL", url: "http://localhost:5000/api/firestore-to-postgres/" },
        { name: "Synchro photo", url: "http://localhost:5000/api/firestore-to-postgres/photo_synchro" }
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
    <div style={{ 
      height: "100vh", 
      width: "100%", 
      position: "relative", 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      overflow: "hidden"
    }}>
      {/* CSS Inline pour les animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          .modal-backdrop {
            backdrop-filter: blur(10px);
            animation: fadeIn 0.3s ease-out;
          }
          
          .modal-card {
            animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .input-field:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            border-color: #3b82f6;
          }
          
          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(16, 185, 129, 0.35);
          }
          
          .cancel-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(100, 116, 139, 0.15);
          }
          
          .popup-btn:hover {
            transform: translateY(-2px);
          }
        `}
      </style>

      {/* ===== BOUTON INSCRIPTION (Design amélioré) ===== */}
      <button
        style={{
          position: "absolute",
          top: "30px",
          left: "30px",
          zIndex: 1000,
          padding: "16px 36px",
          background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
          color: "white",
          border: "none",
          borderRadius: "14px",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "16px",
          letterSpacing: "0.5px",
          boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          minWidth: "170px",
        }}
        onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"}
        onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
        onClick={() => {
          setShowRegister(true);
          fetchTypesAccount();
        }}
      >
        <span style={{ fontSize: "20px" }}>+</span>
        Nouvelle Inscription
      </button>

      {/* ===== BOUTON DÉCONNEXION (Design amélioré) ===== */}
      <button
        style={{
          position: "absolute",
          top: "30px",
          right: "30px",
          zIndex: 1000,
          padding: "16px 36px",
          background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
          color: "white",
          border: "none",
          borderRadius: "14px",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "16px",
          letterSpacing: "0.5px",
          boxShadow: "0 8px 24px rgba(244, 63, 94, 0.3)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          minWidth: "170px",
        }}
        onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"}
        onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
        onClick={onLogout}
      >
        <span style={{ fontSize: "20px" }}>↩</span>
        Déconnexion
      </button>

      {/* ===== BOUTON SYNCHRONISER (Design amélioré) ===== */}
      <button
        onClick={handleSync}
        style={{
          position: "absolute",
          top: "90px",
          right: "30px",
          zIndex: 1000,
          padding: "16px 36px",
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          color: "white",
          border: "none",
          borderRadius: "14px",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "16px",
          letterSpacing: "0.5px",
          boxShadow: "0 8px 24px rgba(245, 158, 11, 0.3)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          minWidth: "170px",
          animation: "float 4s ease-in-out infinite",
        }}
        onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"}
        onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
      >
        <span style={{ fontSize: "20px" }}>🔄</span>
        Synchroniser
      </button>

      {/* ===== MODALE INSCRIPTION (NOUVEAU DESIGN) ===== */}
      {showRegister && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            zIndex: 2000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(10px)",
            animation: "fadeIn 0.3s ease-out",
          }}
          className="modal-backdrop"
        >
          <div
            style={{
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              padding: "48px 40px",
              borderRadius: "28px",
              width: "460px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              position: "relative",
              animation: "slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
            className="modal-card"
          >
            {/* Décoration */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #10b981 100%)",
              borderTopLeftRadius: "28px",
              borderTopRightRadius: "28px",
            }} />
            
            {/* En-tête de la modale */}
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <div style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
              }}>
                <span style={{ fontSize: "38px", color: "white" }}>👤</span>
              </div>
              <h2 style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#1e293b",
                marginBottom: "8px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Créer un compte
              </h2>
              <p style={{
                color: "#64748b",
                fontSize: "15px",
                fontWeight: 500,
                lineHeight: 1.6,
              }}>
                Rejoignez-nous et accédez à toutes les fonctionnalités
              </p>
            </div>

            {/* Champs du formulaire avec icônes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "18px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#8b5cf6",
                  fontSize: "20px",
                }}>👤</div>
                <input
                  placeholder="Nom d'utilisateur"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "18px 20px 18px 55px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "14px",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#1e293b",
                    background: "#ffffff",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxSizing: "border-box",
                  }}
                  className="input-field"
                />
              </div>

              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "18px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#8b5cf6",
                  fontSize: "20px",
                }}>✉</div>
                <input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "18px 20px 18px 55px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "14px",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#1e293b",
                    background: "#ffffff",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxSizing: "border-box",
                  }}
                  className="input-field"
                />
              </div>

              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "18px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#8b5cf6",
                  fontSize: "20px",
                }}>🔒</div>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "18px 20px 18px 55px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "14px",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#1e293b",
                    background: "#ffffff",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxSizing: "border-box",
                  }}
                  className="input-field"
                />
              </div>

              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "18px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#8b5cf6",
                  fontSize: "20px",
                  zIndex: 2,
                }}>🏷</div>
                <select
                  value={form.id_type_account}
                  onChange={(e) => setForm({ ...form, id_type_account: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "18px 20px 18px 55px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "14px",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#1e293b",
                    background: "#ffffff",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxSizing: "border-box",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 20px center",
                    backgroundSize: "20px",
                    paddingRight: "55px",
                  }}
                  className="input-field"
                >
                  <option value="">-- Sélectionnez un type de compte --</option>
                  {typesAccount.map((t) => (
                    <option key={t.id_type_account} value={t.id_type_account}>
                      {t.name_type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Boutons de la modale */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "36px",
              gap: "16px",
            }}>
              <button
                onClick={() => setShowRegister(false)}
                style={{
                  padding: "18px 32px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "2px solid #e2e8f0",
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  flex: 1,
                  textAlign: "center",
                  letterSpacing: "0.5px",
                }}
                className="cancel-btn"
                onMouseOver={e => e.currentTarget.style.background = "#e2e8f0"}
                onMouseOut={e => e.currentTarget.style.background = "#f1f5f9"}
              >
                Annuler
              </button>
              <button
                onClick={handleRegister}
                style={{
                  padding: "18px 32px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  flex: 1,
                  textAlign: "center",
                  letterSpacing: "0.5px",
                  boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                }}
                className="submit-btn"
                onMouseOver={e => e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #047857 100%)"}
                onMouseOut={e => e.currentTarget.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)"}
              >
                <span style={{ position: "relative", zIndex: 2 }}>
                  Créer le compte
                </span>
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                  transition: "left 0.7s ease",
                }} />
              </button>
            </div>

            {/* Footer de la modale */}
            <div style={{
              marginTop: "28px",
              textAlign: "center",
              paddingTop: "20px",
              borderTop: "1px solid #e2e8f0",
            }}>
              <p style={{
                color: "#94a3b8",
                fontSize: "14px",
                fontWeight: 500,
              }}>
                En créant un compte, vous acceptez nos conditions d'utilisation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== CARTE ===== */}
      <MapContainer
        center={position}
        zoom={13}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {points.map((p) => (
          <Marker
            key={p.id_point}
            position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
          >
            <Popup>
              <div style={{
                minWidth: "220px",
                padding: "20px",
                fontFamily: "'Inter', sans-serif",
                borderRadius: "16px",
              }}>
                <div style={{
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "2px solid #f1f5f9",
                }}>
                  <h3 style={{
                    margin: "0 0 8px 0",
                    color: "#8b5cf6",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}>{p.nameplace}</h3>
                  <div style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    background: getStatusOfPoint(p.status) === "Nouveau" ? "#fef3c7" :
                               getStatusOfPoint(p.status) === "En cours" ? "#dbeafe" : "#dcfce7",
                    color: getStatusOfPoint(p.status) === "Nouveau" ? "#92400e" :
                           getStatusOfPoint(p.status) === "En cours" ? "#1e40af" : "#065f46",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}>
                    {getStatusOfPoint(p.status)}
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Surface :</span>
                    <span style={{ color: "#1e293b", fontSize: "14px", fontWeight: 600 }}>{p.surface} m²</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Budget :</span>
                    <span style={{ color: "#1e293b", fontSize: "14px", fontWeight: 600 }}>{p.budget.toLocaleString()} Ariary</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Entreprise :</span>
                    <span style={{ color: "#1e293b", fontSize: "14px", fontWeight: 600 }}>{p.name_entreprise}</span>
                  </div>
                </div>
                
                <div style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  paddingTop: "16px",
                  borderTop: "2px solid #f1f5f9",
                }}>
                  <button
                    onClick={() => handleDeletePoint(p.id_point)}
                    style={{
                      background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 16px",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      flex: 1,
                      minWidth: "0",
                    }}
                    className="popup-btn"
                    onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(p.id_point, "11")}
                    style={{
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 16px",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      flex: 1,
                      minWidth: "0",
                    }}
                    className="popup-btn"
                    onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    En cours
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(p.id_point, "21")}
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 16px",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      flex: 1,
                      minWidth: "0",
                    }}
                    className="popup-btn"
                    onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    Terminé
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapViewLogged;