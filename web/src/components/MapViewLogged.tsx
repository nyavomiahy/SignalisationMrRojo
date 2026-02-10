// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import "leaflet/dist/leaflet.css";

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

//   // const handleSync = async () => {
//   //   try {
//   //     const res = await axios.post("http://localhost:5000/api/sync");
//   //     alert(res.data.message);
//   //     fetchPoints(); // Rafraîchir les points depuis Postgres après sync
//   //   } catch (err) {
//   //     console.error(err);
//   //     alert("Erreur de synchronisation");
//   //   }
//   // };

//   const handleSync = async () => {
//     try {
//       const apis = [
//         { name: "Utilisateurs", url: "http://localhost:5000/api/firestore-to-postgres/postgres-to-firebase-users" },
//         { name: "Générale", url: "http://localhost:5000/api/firestore-to-postgres/postgres-to-firebase" },
//         { name: "Firebase → PostgreSQL", url: "http://localhost:5000/api/firestore-to-postgres/" }
//       ];
  
//       const results = [];
  
//       for (const api of apis) {
//         try {
//           alert(`Debut de la synchronisation appuyer pour synchorniser  ${api.name} en cours... attender environ 2 min pour la synchronisation ⏳`);
//           const response = await axios.post(api.url);
//           results.push({ name: api.name, success: true, data: response.data });
//           console.log(`✅ ${api.name} synchronisé`);
//         } catch (error) {
//           results.push({ name: api.name, success: false, error: error.message });
//           console.error(`❌ ${api.name} échoué:`, error.message);
//         }
//       }
  
//       // Afficher le résumé
//       const successfulCount = results.filter(r => r.success).length;
//       alert(`Synchronisation terminée!\n\nSuccès: ${successfulCount}/3\nÉchecs: ${3 - successfulCount}`);
  
//       // Recharger les points
//       const res = await axios.get("http://localhost:5000/api/points");
//       setPoints(res.data);
  
//     } catch (err: any) {
//       alert("Erreur de synchronisation ❌");
//       console.error(err);
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
//     <div style={{ 
//       height: "100vh", 
//       width: "100%", 
//       position: "relative", 
//       fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//       background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
//       overflow: "hidden"
//     }}>
//       {/* CSS Inline pour les animations */}
//       <style>
//         {`
//           @keyframes fadeIn {
//             from { opacity: 0; }
//             to { opacity: 1; }
//           }
          
//           @keyframes slideUp {
//             from {
//               opacity: 0;
//               transform: translateY(30px);
//             }
//             to {
//               opacity: 1;
//               transform: translateY(0);
//             }
//           }
          
//           @keyframes float {
//             0%, 100% { transform: translateY(0px); }
//             50% { transform: translateY(-10px); }
//           }
          
//           @keyframes shimmer {
//             0% { background-position: -1000px 0; }
//             100% { background-position: 1000px 0; }
//           }
          
//           .modal-backdrop {
//             backdrop-filter: blur(10px);
//             animation: fadeIn 0.3s ease-out;
//           }
          
//           .modal-card {
//             animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//           }
          
//           .input-field:focus {
//             box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
//             border-color: #3b82f6;
//           }
          
//           .submit-btn:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 12px 25px rgba(16, 185, 129, 0.35);
//           }
          
//           .cancel-btn:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 8px 20px rgba(100, 116, 139, 0.15);
//           }
          
//           .popup-btn:hover {
//             transform: translateY(-2px);
//           }
//         `}
//       </style>

//       {/* ===== BOUTON INSCRIPTION (Design amélioré) ===== */}
//       <button
//         style={{
//           position: "absolute",
//           top: "30px",
//           left: "30px",
//           zIndex: 1000,
//           padding: "16px 36px",
//           background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
//           color: "white",
//           border: "none",
//           borderRadius: "14px",
//           cursor: "pointer",
//           fontWeight: 700,
//           fontSize: "16px",
//           letterSpacing: "0.5px",
//           boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
//           transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "10px",
//           minWidth: "170px",
//         }}
//         onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"}
//         onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
//         onClick={() => {
//           setShowRegister(true);
//           fetchTypesAccount();
//         }}
//       >
//         <span style={{ fontSize: "20px" }}>+</span>
//         Nouvelle Inscription
//       </button>

//       {/* ===== BOUTON DÉCONNEXION (Design amélioré) ===== */}
//       <button
//         style={{
//           position: "absolute",
//           top: "30px",
//           right: "30px",
//           zIndex: 1000,
//           padding: "16px 36px",
//           background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
//           color: "white",
//           border: "none",
//           borderRadius: "14px",
//           cursor: "pointer",
//           fontWeight: 700,
//           fontSize: "16px",
//           letterSpacing: "0.5px",
//           boxShadow: "0 8px 24px rgba(244, 63, 94, 0.3)",
//           transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "10px",
//           minWidth: "170px",
//         }}
//         onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"}
//         onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
//         onClick={onLogout}
//       >
//         <span style={{ fontSize: "20px" }}>↩</span>
//         Déconnexion
//       </button>

//       {/* ===== BOUTON SYNCHRONISER (Design amélioré) ===== */}
//       <button
//         onClick={handleSync}
//         style={{
//           position: "absolute",
//           top: "90px",
//           right: "30px",
//           zIndex: 1000,
//           padding: "16px 36px",
//           background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
//           color: "white",
//           border: "none",
//           borderRadius: "14px",
//           cursor: "pointer",
//           fontWeight: 700,
//           fontSize: "16px",
//           letterSpacing: "0.5px",
//           boxShadow: "0 8px 24px rgba(245, 158, 11, 0.3)",
//           transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "10px",
//           minWidth: "170px",
//           animation: "float 4s ease-in-out infinite",
//         }}
//         onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"}
//         onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
//       >
//         <span style={{ fontSize: "20px" }}>🔄</span>
//         Synchroniser
//       </button>

//       {/* ===== MODALE INSCRIPTION (NOUVEAU DESIGN) ===== */}
//       {showRegister && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             backgroundColor: "rgba(15, 23, 42, 0.7)",
//             zIndex: 2000,
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             backdropFilter: "blur(10px)",
//             animation: "fadeIn 0.3s ease-out",
//           }}
//           className="modal-backdrop"
//         >
//           <div
//             style={{
//               background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
//               padding: "48px 40px",
//               borderRadius: "28px",
//               width: "460px",
//               maxWidth: "90vw",
//               maxHeight: "90vh",
//               overflowY: "auto",
//               boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
//               border: "1px solid rgba(255, 255, 255, 0.2)",
//               position: "relative",
//               animation: "slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
//             }}
//             className="modal-card"
//           >
//             {/* Décoration */}
//             <div style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               height: "6px",
//               background: "linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #10b981 100%)",
//               borderTopLeftRadius: "28px",
//               borderTopRightRadius: "28px",
//             }} />
            
//             {/* En-tête de la modale */}
//             <div style={{ textAlign: "center", marginBottom: "36px" }}>
//               <div style={{
//                 width: "80px",
//                 height: "80px",
//                 background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
//                 borderRadius: "50%",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 margin: "0 auto 20px",
//                 boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
//               }}>
//                 <span style={{ fontSize: "38px", color: "white" }}>👤</span>
//               </div>
//               <h2 style={{
//                 fontSize: "32px",
//                 fontWeight: 800,
//                 color: "#1e293b",
//                 marginBottom: "8px",
//                 background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//                 backgroundClip: "text",
//               }}>
//                 Créer un compte
//               </h2>
//               <p style={{
//                 color: "#64748b",
//                 fontSize: "15px",
//                 fontWeight: 500,
//                 lineHeight: 1.6,
//               }}>
//                 Rejoignez-nous et accédez à toutes les fonctionnalités
//               </p>
//             </div>

//             {/* Champs du formulaire avec icônes */}
//             <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
//               <div style={{ position: "relative" }}>
//                 <div style={{
//                   position: "absolute",
//                   left: "18px",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   color: "#8b5cf6",
//                   fontSize: "20px",
//                 }}>👤</div>
//                 <input
//                   placeholder="Nom d'utilisateur"
//                   value={form.username}
//                   onChange={(e) => setForm({ ...form, username: e.target.value })}
//                   style={{
//                     width: "100%",
//                     padding: "18px 20px 18px 55px",
//                     border: "2px solid #e2e8f0",
//                     borderRadius: "14px",
//                     fontSize: "16px",
//                     fontWeight: 500,
//                     color: "#1e293b",
//                     background: "#ffffff",
//                     transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                     boxSizing: "border-box",
//                   }}
//                   className="input-field"
//                 />
//               </div>

//               <div style={{ position: "relative" }}>
//                 <div style={{
//                   position: "absolute",
//                   left: "18px",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   color: "#8b5cf6",
//                   fontSize: "20px",
//                 }}>✉</div>
//                 <input
//                   placeholder="Email"
//                   value={form.email}
//                   onChange={(e) => setForm({ ...form, email: e.target.value })}
//                   style={{
//                     width: "100%",
//                     padding: "18px 20px 18px 55px",
//                     border: "2px solid #e2e8f0",
//                     borderRadius: "14px",
//                     fontSize: "16px",
//                     fontWeight: 500,
//                     color: "#1e293b",
//                     background: "#ffffff",
//                     transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                     boxSizing: "border-box",
//                   }}
//                   className="input-field"
//                 />
//               </div>

//               <div style={{ position: "relative" }}>
//                 <div style={{
//                   position: "absolute",
//                   left: "18px",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   color: "#8b5cf6",
//                   fontSize: "20px",
//                 }}>🔒</div>
//                 <input
//                   type="password"
//                   placeholder="Mot de passe"
//                   value={form.password}
//                   onChange={(e) => setForm({ ...form, password: e.target.value })}
//                   style={{
//                     width: "100%",
//                     padding: "18px 20px 18px 55px",
//                     border: "2px solid #e2e8f0",
//                     borderRadius: "14px",
//                     fontSize: "16px",
//                     fontWeight: 500,
//                     color: "#1e293b",
//                     background: "#ffffff",
//                     transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                     boxSizing: "border-box",
//                   }}
//                   className="input-field"
//                 />
//               </div>

//               <div style={{ position: "relative" }}>
//                 <div style={{
//                   position: "absolute",
//                   left: "18px",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   color: "#8b5cf6",
//                   fontSize: "20px",
//                   zIndex: 2,
//                 }}>🏷</div>
//                 <select
//                   value={form.id_type_account}
//                   onChange={(e) => setForm({ ...form, id_type_account: e.target.value })}
//                   style={{
//                     width: "100%",
//                     padding: "18px 20px 18px 55px",
//                     border: "2px solid #e2e8f0",
//                     borderRadius: "14px",
//                     fontSize: "16px",
//                     fontWeight: 500,
//                     color: "#1e293b",
//                     background: "#ffffff",
//                     transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                     boxSizing: "border-box",
//                     appearance: "none",
//                     backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
//                     backgroundRepeat: "no-repeat",
//                     backgroundPosition: "right 20px center",
//                     backgroundSize: "20px",
//                     paddingRight: "55px",
//                   }}
//                   className="input-field"
//                 >
//                   <option value="">-- Sélectionnez un type de compte --</option>
//                   {typesAccount.map((t) => (
//                     <option key={t.id_type_account} value={t.id_type_account}>
//                       {t.name_type}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Boutons de la modale */}
//             <div style={{
//               display: "flex",
//               justifyContent: "space-between",
//               marginTop: "36px",
//               gap: "16px",
//             }}>
//               <button
//                 onClick={() => setShowRegister(false)}
//                 style={{
//                   padding: "18px 32px",
//                   background: "#f1f5f9",
//                   color: "#475569",
//                   border: "2px solid #e2e8f0",
//                   borderRadius: "14px",
//                   fontWeight: 700,
//                   fontSize: "16px",
//                   cursor: "pointer",
//                   transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                   flex: 1,
//                   textAlign: "center",
//                   letterSpacing: "0.5px",
//                 }}
//                 className="cancel-btn"
//                 onMouseOver={e => e.currentTarget.style.background = "#e2e8f0"}
//                 onMouseOut={e => e.currentTarget.style.background = "#f1f5f9"}
//               >
//                 Annuler
//               </button>
//               <button
//                 onClick={handleRegister}
//                 style={{
//                   padding: "18px 32px",
//                   background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "14px",
//                   fontWeight: 700,
//                   fontSize: "16px",
//                   cursor: "pointer",
//                   transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                   flex: 1,
//                   textAlign: "center",
//                   letterSpacing: "0.5px",
//                   boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
//                   position: "relative",
//                   overflow: "hidden",
//                 }}
//                 className="submit-btn"
//                 onMouseOver={e => e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #047857 100%)"}
//                 onMouseOut={e => e.currentTarget.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)"}
//               >
//                 <span style={{ position: "relative", zIndex: 2 }}>
//                   Créer le compte
//                 </span>
//                 <div style={{
//                   position: "absolute",
//                   top: 0,
//                   left: "-100%",
//                   width: "100%",
//                   height: "100%",
//                   background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
//                   transition: "left 0.7s ease",
//                 }} />
//               </button>
//             </div>

//             {/* Footer de la modale */}
//             <div style={{
//               marginTop: "28px",
//               textAlign: "center",
//               paddingTop: "20px",
//               borderTop: "1px solid #e2e8f0",
//             }}>
//               <p style={{
//                 color: "#94a3b8",
//                 fontSize: "14px",
//                 fontWeight: 500,
//               }}>
//                 En créant un compte, vous acceptez nos conditions d'utilisation
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ===== CARTE ===== */}
//       <MapContainer
//         center={position}
//         zoom={13}
//         style={{
//           height: "100%",
//           width: "100%",
//           borderRadius: "20px",
//           boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//         {points.map((p) => (
//           <Marker
//             key={p.id_point}
//             position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
//           >
//             <Popup>
//               <div style={{
//                 minWidth: "220px",
//                 padding: "20px",
//                 fontFamily: "'Inter', sans-serif",
//                 borderRadius: "16px",
//               }}>
//                 <div style={{
//                   marginBottom: "16px",
//                   paddingBottom: "12px",
//                   borderBottom: "2px solid #f1f5f9",
//                 }}>
//                   <h3 style={{
//                     margin: "0 0 8px 0",
//                     color: "#8b5cf6",
//                     fontSize: "18px",
//                     fontWeight: 700,
//                   }}>{p.nameplace}</h3>
//                   <div style={{
//                     display: "inline-block",
//                     padding: "6px 12px",
//                     background: getStatusOfPoint(p.status) === "Nouveau" ? "#fef3c7" :
//                                getStatusOfPoint(p.status) === "En cours" ? "#dbeafe" : "#dcfce7",
//                     color: getStatusOfPoint(p.status) === "Nouveau" ? "#92400e" :
//                            getStatusOfPoint(p.status) === "En cours" ? "#1e40af" : "#065f46",
//                     borderRadius: "20px",
//                     fontSize: "12px",
//                     fontWeight: 600,
//                   }}>
//                     {getStatusOfPoint(p.status)}
//                   </div>
//                 </div>
                
//                 <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     <span style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Surface :</span>
//                     <span style={{ color: "#1e293b", fontSize: "14px", fontWeight: 600 }}>{p.surface} m²</span>
//                   </div>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     <span style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Budget :</span>
//                     <span style={{ color: "#1e293b", fontSize: "14px", fontWeight: 600 }}>{p.budget.toLocaleString()} Ariary</span>
//                   </div>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     <span style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Entreprise :</span>
//                     <span style={{ color: "#1e293b", fontSize: "14px", fontWeight: 600 }}>{p.name_entreprise}</span>
//                   </div>
//                 </div>
                
//                 <div style={{
//                   display: "flex",
//                   gap: "10px",
//                   flexWrap: "wrap",
//                   paddingTop: "16px",
//                   borderTop: "2px solid #f1f5f9",
//                 }}>
//                   <button
//                     onClick={() => handleDeletePoint(p.id_point)}
//                     style={{
//                       background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
//                       color: "white",
//                       border: "none",
//                       borderRadius: "10px",
//                       padding: "10px 16px",
//                       fontWeight: 600,
//                       fontSize: "13px",
//                       cursor: "pointer",
//                       transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
//                       flex: 1,
//                       minWidth: "0",
//                     }}
//                     className="popup-btn"
//                     onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
//                     onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
//                   >
//                     Supprimer
//                   </button>
//                   <button
//                     onClick={() => handleUpdateStatus(p.id_point, "11")}
//                     style={{
//                       background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
//                       color: "white",
//                       border: "none",
//                       borderRadius: "10px",
//                       padding: "10px 16px",
//                       fontWeight: 600,
//                       fontSize: "13px",
//                       cursor: "pointer",
//                       transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
//                       flex: 1,
//                       minWidth: "0",
//                     }}
//                     className="popup-btn"
//                     onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
//                     onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
//                   >
//                     En cours
//                   </button>
//                   <button
//                     onClick={() => handleUpdateStatus(p.id_point, "21")}
//                     style={{
//                       background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
//                       color: "white",
//                       border: "none",
//                       borderRadius: "10px",
//                       padding: "10px 16px",
//                       fontWeight: 600,
//                       fontSize: "13px",
//                       cursor: "pointer",
//                       transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
//                       flex: 1,
//                       minWidth: "0",
//                     }}
//                     className="popup-btn"
//                     onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
//                     onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
//                   >
//                     Terminé
//                   </button>
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
import { useNavigate } from "react-router-dom";
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

type StatusPoint = {
  id_point: number;
  status: string;
};

type Props = {
  onLogout: () => void;
};

/* ================= COMPONENT ================= */
function MapViewLogged({ onLogout }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const [statusList, setStatusList] = useState<StatusPoint[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);


  /* ===== inscription ===== */
  const [showRegister, setShowRegister] = useState(false);
  const [typesAccount, setTypesAccount] = useState<TypeAccount[]>([]);
  const [form, setForm] = useState({
    username: "",
    email: "manager01@test.com",
    password: "test123456",
    id_type_account: "",
  });

  /* ================= CALCUL RÉCAPITULATIF ================= */
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

  const pointsWithStatus = points.map((p) => {
    const st = statusList.find((s) => s.id_point === p.id_point);
    return {
      ...p,
      status: st ? st.status : "1",
    };
  });

  const recap = {
    nombrePoints: pointsWithStatus.length,
    totalSurface: pointsWithStatus.reduce((acc, p) => acc + Number(p.surface), 0),
    totalBudget: pointsWithStatus.reduce((acc, p) => acc + Number(p.budget), 0),
    avancement: pointsWithStatus.length > 0 
      ? Math.round(pointsWithStatus.reduce((acc, p) => acc + getProgressFromStatus(p.status), 0) / pointsWithStatus.length)
      : 0,
  };

  /* ================= USE EFFECT ================= */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });

    fetchPoints();
    fetchStatus();
  }, []);

  /* ================= API CALLS ================= */
  const fetchPoints = () => {
    axios
      .get("http://localhost:5000/api/points")
      .then((res) => setPoints(res.data))
      .catch((err) => console.error(err));
  };

  const fetchStatus = () => {
    axios
      .get("http://localhost:5000/api/status_point")
      .then((res) => setStatusList(res.data))
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
      fetchStatus();
    } catch (err) {
      console.error(err);
    }
  };

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
          alert(`Début de la synchronisation ${api.name}... Attendez environ 2 minutes ⏳`);
          const response = await axios.post(api.url);
          results.push({ name: api.name, success: true, data: response.data });
          console.log(`✅ ${api.name} synchronisé`);
        } catch (error: any) {
          results.push({ name: api.name, success: false, error: error.message });
          console.error(`❌ ${api.name} échoué:`, error.message);
        }
      }
  
      const successfulCount = results.filter(r => r.success).length;
      alert(`Synchronisation terminée!\n\nSuccès: ${successfulCount}/3\nÉchecs: ${3 - successfulCount}`);
  
      fetchPoints();
      fetchStatus();
  
    } catch (err: any) {
      alert("Erreur de synchronisation ❌");
      console.error(err);
    }
  };

  if (!position) return <p>Localisation en cours...</p>;

  /* ================= RENDER ================= */
  return (
    <div style={{ 
      height: "100vh", 
      width: "100%", 
      display: "flex",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      overflow: "hidden"
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? "320px" : "80px",
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        color: "white",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Bouton toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            color: "white",
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            transition: "all 0.3s",
            zIndex: 1001,
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>

        {/* Logo - Partie fixe en haut */}
        <div style={{
          padding: "30px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center",
          flexShrink: 0, // Empêche le logo de rétrécir
        }}>
          {sidebarOpen ? (
            <h1 style={{
              fontSize: "22px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
            }}>
              Gestion Manager
            </h1>
          ) : (
            <div style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#8b5cf6",
            }}>
              A
            </div>
          )}
        </div>

        {/* Contenu défilant de la sidebar */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto", // Permet le défilement vertical
          minHeight: 0, // Important pour le défilement
        }}>
          {/* Statistiques */}
          {sidebarOpen && (
            <div style={{
              background: "rgba(59, 130, 246, 0.1)",
              margin: "20px",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              flexShrink: 0, // Empêche le rétrécissement
            }}>
              <h3 style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#94a3b8",
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span>📊</span> Vue d'ensemble
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>Points actifs</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>{recap.nombrePoints}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>Surface totale</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>{recap.totalSurface} m²</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>Avancement global</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#10b981" }}>{recap.avancement}%</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>Budget total</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>{recap.totalBudget.toLocaleString()} Ar</div>
                </div>
              </div>
            </div>
          )}

          {/* Menu Actions */}
          <div style={{
            padding: "0 20px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            flex: 1,
          }}>
            {!sidebarOpen && (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                gap: "20px", 
                paddingTop: "40px",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: "24px" }}>📊</span>
                <span style={{ fontSize: "24px" }}>⚙️</span>
              </div>
            )}

            {/* Boutons avec icônes */}
            {[
              { 
                icon: "👤", 
                label: "Nouveau compte", 
                action: () => { 
                  setShowRegister(true); 
                  fetchTypesAccount(); 
                },
                color: "#8b5cf6",
                description: "Ajouter un nouvel utilisateur"
              },
              { 
                icon: "🔄", 
                label: "Synchroniser", 
                action: handleSync,
                color: "#f59e0b",
                description: "Sync avec Firebase"
              },
              { 
                icon: "👥",  // Icône ajoutée ici
                label: "Gestion compte", 
                // action: () => navigate("/gestion-compte"),
                action: () => {
                  window.location.href = "/gestion-compte"; // redirige vers la page
                },
                color: "#ef4444",
                description: "Gérer les utilisateurs"
              },
              {
                icon: "👥",
                label: "compte bloquée",
                action: () => {
                  window.location.href = "/gestion-compte-bloque";
                },
                color: "#ef4444",
                description: "Gérer les utilisateurs bloqué"
              }

            ].map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                style={{
                  margin: sidebarOpen ? "0" : "0 auto",
                  padding: sidebarOpen ? "15px 20px" : "15px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${item.color}20`,
                  color: "white",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  width: sidebarOpen ? "100%" : "50px",
                  height: sidebarOpen ? "auto" : "50px",
                  position: "relative",
                  flexShrink: 0,
                  textAlign: "left",
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.transform = "translateX(5px)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <span style={{ fontSize: "20px", color: item.color }}>{item.icon}</span>
                {sidebarOpen && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span>{item.label}</span>
                    <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 400, marginTop: "2px" }}>
                      {item.description}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Déconnexion - Partie fixe en bas */}
        <div style={{
          padding: "20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          flexShrink: 0, // Empêche le footer de rétrécir
        }}>
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              padding: sidebarOpen ? "15px" : "15px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fecaca",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              justifyContent: sidebarOpen ? "flex-start" : "center",
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: "20px" }}>↩</span>
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Contenu principal - Carte */}
      <div style={{ 
        flex: 1, 
        position: "relative",
        padding: "20px",
      }}>
        {/* Indicateur de chargement */}
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255, 255, 255, 0.95)",
          padding: "12px 24px",
          borderRadius: "20px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "14px",
          fontWeight: 600,
          color: "#1e293b",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}>
          <div style={{
            width: "12px",
            height: "12px",
            background: "#10b981",
            borderRadius: "50%",
            animation: "pulse 1.5s infinite"
          }} />
          {points.length} chantiers chargés
        </div>

        <MapContainer
          center={position}
          zoom={13}
          style={{
            height: "100%",
            width: "100%",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
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
                  minWidth: "240px",
                  padding: "20px",
                  fontFamily: "'Inter', sans-serif",
                  borderRadius: "16px",
                  background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
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
                        transition: "all 0.2s",
                        flex: 1,
                        minWidth: "0",
                        boxShadow: "0 4px 12px rgba(244, 63, 94, 0.2)",
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(244, 63, 94, 0.3)";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(244, 63, 94, 0.2)";
                      }}
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
                        transition: "all 0.2s",
                        flex: 1,
                        minWidth: "0",
                        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(245, 158, 11, 0.3)";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.2)";
                      }}
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
                        transition: "all 0.2s",
                        flex: 1,
                        minWidth: "0",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.3)";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.2)";
                      }}
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

      {/* Modale inscription */}
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
        >
          <div
            style={{
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              padding: "48px 40px",
              borderRadius: "28px",
              width: "460px",
              maxWidth: "90vw",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              position: "relative",
              animation: "slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
          >
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
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "8px",
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
                    transition: "all 0.3s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b5cf6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
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
                    transition: "all 0.3s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b5cf6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
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
                    transition: "all 0.3s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b5cf6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
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
                    transition: "all 0.3s",
                    boxSizing: "border-box",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 20px center",
                    backgroundSize: "20px",
                    paddingRight: "55px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b5cf6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
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
                  transition: "all 0.3s",
                  flex: 1,
                  textAlign: "center",
                  letterSpacing: "0.5px",
                }}
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
                  transition: "all 0.3s",
                  flex: 1,
                  textAlign: "center",
                  letterSpacing: "0.5px",
                  boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
                }}
                onMouseOver={e => e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #047857 100%)"}
                onMouseOut={e => e.currentTarget.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)"}
              >
                Créer le compte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS pour les animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
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
          
          .leaflet-popup-content {
            animation: fadeIn 0.3s ease-out;
          }
          
          /* Style pour la scrollbar de la sidebar */
          ::-webkit-scrollbar {
            width: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}
      </style>
    </div>
  );
}

export default MapViewLogged;