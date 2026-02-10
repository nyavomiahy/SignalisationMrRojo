import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
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
  photoUrl?: string;
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });

    axios.get("http://localhost:5000/api/points")
      .then((res) => setPoints(res.data))
      .catch((err) => console.error(err));

    axios.get("http://localhost:5000/api/status_point")
      .then((res) => setStatusList(res.data))
      .catch((err) => console.error(err));
  }, []);

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
      alert(err.response?.data?.error || "Erreur de connexion");
    }
  };

  if (!position) return <p>Localisation en cours...</p>;

  return (
    <div style={{ 
      height: "100vh", 
      width: "100%", 
      display: "flex",
      fontFamily: 'Inter, Arial, sans-serif', 
      background: '#f4f6fa' 
    }}>
      {/* Sidebar pour non connecté */}
      <div style={{
        width: sidebarOpen ? "300px" : "80px",
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        color: "white",
        transition: "all 0.3s",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
        overflow: "hidden",
      }}>
        {/* Bouton toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            color: "white",
            padding: "10px",
            cursor: "pointer",
            fontSize: "20px",
            transition: "all 0.3s",
          }}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>

        {/* Logo */}
        <div style={{
          padding: "20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center",
        }}>
          {sidebarOpen ? (
            <h1 style={{
              fontSize: "24px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
            }}>
              GeoManager
            </h1>
          ) : (
            <div style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#8b5cf6",
            }}>
              G
            </div>
          )}
        </div>

        {/* Contenu de la sidebar */}
        <div style={{
          flex: 1,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}>
          {sidebarOpen ? (
            <>
              <div>
                <h3 style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "10px" }}>Récapitulatif</h3>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px" }}>Points</span>
                    <span style={{ fontWeight: 700 }}>{recap.nombrePoints}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px" }}>Surface totale</span>
                    <span style={{ fontWeight: 700 }}>{recap.totalSurface} m²</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px" }}>Avancement</span>
                    <span style={{ fontWeight: 700, color: "#10b981" }}>{recap.avancement}%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "14px" }}>Budget total</span>
                    <span style={{ fontWeight: 700 }}>{recap.totalBudget.toLocaleString()} Ariary</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsLoginOpen(true)}
                style={{
                  padding: "15px",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "16px",
                  transition: "all 0.3s",
                }}
                onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                Connexion
              </button>

              <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.6 }}>
                Connectez-vous pour accéder à toutes les fonctionnalités : gestion des points, synchronisation, etc.
              </p>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", paddingTop: "40px" }}>
              <button
                onClick={() => setIsLoginOpen(true)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "white",
                  width: "50px",
                  height: "50px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                🔑
              </button>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#10b981" }}>{recap.nombrePoints}</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>Points</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {sidebarOpen && (
          <div style={{
            padding: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: "12px",
            color: "#94a3b8",
            textAlign: "center",
          }}>
            Version non connectée
          </div>
        )}
      </div>

      {/* Partie carte */}
      <div style={{ 
        flex: 1, 
        position: "relative",
        padding: "20px",
      }}>
        <MapContainer 
          center={position} 
          zoom={13} 
          style={{ 
            height: "100%", 
            width: "100%", 
            borderRadius: 18, 
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)' 
          }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {pointsWithStatus.map((p) => (
            <Marker key={p.id_point} position={[parseFloat(p.latitude), parseFloat(p.longitude)]}>
              <Popup>
                <div style={{fontSize:14, minWidth:180, color:'#222'}}>
                  <b style={{color:'#2563eb'}}>{p.nameplace}</b><br/>
                  <span>Surface: <b>{p.surface} m²</b></span><br/>
                  <span>Budget: <b>{p.budget} Ariary</b></span><br/>
                  <span>Entreprise: <b>{p.name_entreprise}</b></span><br/>
                  <span>Status: <b>{getStatusOfPoint(p.status)}</b></span><br/>
                  <Link 
                    to={`/image/${p.id_point}`} 
                    style={{
                      color: "#2563eb",
                      textDecoration: "underline",
                      fontWeight: 600,
                      marginTop: 8,
                      display: "inline-block",
                    }}
                  >
                    Voir la photo
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Modale de connexion */}
      {isLoginOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:2000,display:'flex',justifyContent:'center',alignItems:'center',animation:'fadeIn 0.2s'}}>
          <div style={{background:'#fff',padding:36,borderRadius:20,width:350,boxShadow:'0 8px 32px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column',gap:10}}>
            <h2 style={{marginBottom:18, color:'#2563eb'}}>Login</h2>
            <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:10}}>
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{padding:10,borderRadius:8,border:'1px solid #e5e7eb',fontSize:15}}/>
              <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required style={{padding:10,borderRadius:8,border:'1px solid #e5e7eb',fontSize:15}}/>  
              <p style={{fontSize:12,color:'#6b7280'}}>Email Manager: "manager01@test.com"</p>
              <p style={{fontSize:12,color:'#6b7280'}}>Mot de passe Manager: "test123456"</p>
              <button type="submit" style={{background:'linear-gradient(90deg,#1d4ed8 60%,#60a5fa 100%)',color:'white',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:700,cursor:'pointer',transition:'background 0.2s'}} onMouseOver={e=>e.currentTarget.style.background='#2563eb'} onMouseOut={e=>e.currentTarget.style.background='linear-gradient(90deg,#1d4ed8 60%,#60a5fa 100%)'}>Se connecter</button>
            </form>
            <button onClick={() => setIsLoginOpen(false)} style={{background:'#f3f4f6',color:'#374151',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:600,cursor:'pointer',transition:'background 0.2s'}} onMouseOver={e=>e.currentTarget.style.background='#e5e7eb'} onMouseOut={e=>e.currentTarget.style.background='#f3f4f6'}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;