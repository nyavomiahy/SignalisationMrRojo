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
  niveau?: number | null; // Ajout du champ niveau
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
  const navigate = useNavigate();
  const [points, setPoints] = useState<Point[]>([]);
  const [statusList, setStatusList] = useState<StatusPoint[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ===== Modal niveau ===== */
  const [showNiveauModal, setShowNiveauModal] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);
  const [niveau, setNiveau] = useState<number>(0);

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
      .then((res) => {
        console.log("Points chargés:", res.data);
        setPoints(res.data);
      })
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

  // Nouvelle fonction pour ouvrir le modal niveau
  const handleEnCoursClick = (id_point: number) => {
    setSelectedPointId(id_point);
    setNiveau(0);
    setShowNiveauModal(true);
  };

  // Fonction pour valider et envoyer le niveau
  const handleValidateNiveau = async () => {
    if (selectedPointId === null) return;

    try {
      console.log("Envoi des données pour mettre à jour le niveau:", {
        id_point: selectedPointId,
        status: "11",
        niveau: niveau,
        daty: new Date().toISOString().split("T")[0],
      });

      await axios.post("http://localhost:5000/api/status_point", {
        id_point: selectedPointId,
        status: "11",
        niveau: niveau,
        daty: new Date().toISOString().split("T")[0],
      });
      
      setShowNiveauModal(false);
      setSelectedPointId(null);
      setNiveau(0);
      
      // Recharger les données pour voir le niveau mis à jour
      fetchPoints();
      fetchStatus();
      
      alert("Niveau défini avec succès ✅");
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour:", err.response?.data || err.message);
      alert("Erreur: " + (err.response?.data?.error || err.message));
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
        { 
          name: "Synchro photo", url: "http://localhost:5000/api/firestore-to-postgres/photo_synchro" 
        }
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
      alert(`Synchronisation terminée!\n\nSuccès: ${successfulCount}/1\nÉchecs: ${1 - successfulCount}`);

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

        {/* Logo */}
        <div style={{
          padding: "30px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center",
          flexShrink: 0,
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

        {/* Contenu défilant */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          minHeight: 0,
        }}>
          {/* Statistiques */}
          {sidebarOpen && (
            <div style={{
              background: "rgba(59, 130, 246, 0.1)",
              margin: "20px",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              flexShrink: 0,
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
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>{(recap.totalBudget ?? 0).toLocaleString()} Ar</div>
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
                icon: "👥",
                label: "Gestion compte",
                action: () => navigate("/gestion-compte"),
                color: "#ef4444",
                description: "Gérer les utilisateurs"
              },
              {
                icon: "🔒",
                label: "Comptes bloqués",
                action: () => navigate("/gestion-compte-bloque"),
                color: "#ef4444",
                description: "Gérer les utilisateurs bloqués"
              },
              { 
                icon: "⚙️",  
                label: "parametre prix", 
                action: () => navigate("/parametre_prix"), // <-- OK, utilise navigate ici
                color: "#ef4444",
                description: "modification des prix et ajout de nouvelle prix"
              },
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

        {/* Déconnexion */}
        <div style={{
          padding: "20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          flexShrink: 0,
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

          {points.map((p) => {
            const pointStatus = statusList.find(s => s.id_point === p.id_point)?.status || "1";
            // Vérifier si le point a déjà un niveau dans les données récupérées
            const hasNiveau = p.niveau !== null && p.niveau !== undefined;
            const niveauValue = p.niveau;
            
            return (
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
                        background: getStatusOfPoint(pointStatus) === "Nouveau" ? "#fef3c7" :
                          getStatusOfPoint(pointStatus) === "En cours" ? "#dbeafe" : "#dcfce7",
                        color: getStatusOfPoint(pointStatus) === "Nouveau" ? "#92400e" :
                          getStatusOfPoint(pointStatus) === "En cours" ? "#1e40af" : "#065f46",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}>
                        {getStatusOfPoint(pointStatus)}
                        {hasNiveau && niveauValue !== null && (
                          <span style={{ marginLeft: "8px", fontSize: "11px" }}>
                            (Niveau: {niveauValue})
                          </span>
                        )}
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
                      {hasNiveau && niveauValue !== null && (
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          padding: "8px",
                          background: "#f0f9ff",
                          borderRadius: "8px",
                          border: "1px solid #dbeafe"
                        }}>
                          <span style={{ color: "#1d4ed8", fontSize: "14px", fontWeight: 600 }}>Niveau défini :</span>
                          <span style={{ 
                            color: "#1e40af", 
                            fontSize: "16px", 
                            fontWeight: 700,
                            background: "#dbeafe",
                            padding: "4px 12px",
                            borderRadius: "20px"
                          }}>{niveauValue}</span>
                        </div>
                      )}
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
                      
                      {/* Bouton En cours - NE S'AFFICHE PAS si le point a déjà un niveau */}
                      {!hasNiveau ? (
                        <button
                          onClick={() => handleEnCoursClick(p.id_point)}
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
                      ) : (
                        <div style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "10px 16px",
                          background: "#f1f5f9",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0"
                        }}>
                          <span style={{
                            color: "#64748b",
                            fontSize: "13px",
                            fontWeight: 600,
                            textAlign: "center"
                          }}>
                            Niveau déjà défini
                          </span>
                        </div>
                      )}
                      
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
            );
          })}
        </MapContainer>
      </div>

      {/* Modal Niveau */}
      {showNiveauModal && (
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
          onClick={() => setShowNiveauModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              width: "400px",
              maxWidth: "90vw",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              animation: "slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              Définir le niveau
            </h2>
            
            <div style={{
              background: "#fef3c7",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "1px solid #fbbf24"
            }}>
              <p style={{
                color: "#92400e",
                fontSize: "14px",
                fontWeight: 500,
                margin: 0,
                textAlign: "center"
              }}>
           
              </p>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "8px"
              }}>
                Niveau (de 0 à 10) :
              </label>
              <input
                type="number"
                value={niveau}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 0 && value <= 10) {
                    setNiveau(value);
                  }
                }}
                min="0"
                max="10"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#1e293b",
                  boxSizing: "border-box",
                  transition: "all 0.3s"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#f59e0b";
                  e.target.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "8px",
                flexWrap: "wrap",
                gap: "4px"
              }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNiveau(num)}
                    style={{
                      padding: "6px 10px",
                      background: niveau === num ? "#f59e0b" : "#f1f5f9",
                      color: niveau === num ? "white" : "#475569",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      minWidth: "30px"
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: "12px",
            }}>
              <button
                onClick={() => setShowNiveauModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseOver={e => e.currentTarget.style.background = "#e2e8f0"}
                onMouseOut={e => e.currentTarget.style.background = "#f1f5f9"}
              >
                Annuler
              </button>
              <button
                onClick={handleValidateNiveau}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #d97706 0%, #b45309 100%)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale inscription (reste identique) */}
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
          {/* ... (le reste du modal inscription reste inchangé) ... */}
        </div>
      )}

      {/* Styles CSS */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
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
          
          .leaflet-popup-content {
            animation: fadeIn 0.3s ease-out;
          }
          
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