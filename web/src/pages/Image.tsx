import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

// Définir le type pour une image
interface ImageItem {
  base64: string;
}

// Définir le type pour les informations du point
interface PointInfo {
  id_point: number;
  nameplace: string;
  surface: number;
  budget: number;
  name_entreprise: string;
  latitude: string;
  longitude: string;
  status?: string;
}

function ImagePage() {
  const { idPoint } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pointInfo, setPointInfo] = useState<PointInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idPoint) return;

    // Récupérer les images
    axios
      .get(`http://localhost:5000/api/points/images/${idPoint}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setImages(res.data);
        } else if (res.data.images && Array.isArray(res.data.images)) {
          setImages(res.data.images);
        } else if (res.data.base64) {
          setImages([res.data]);
        }
      })
      .catch(err => {
        console.error(err);
        setImages([]);
      });

    // Récupérer les informations du point
    axios
      .get(`http://localhost:5000/api/points`)
      .then(res => {
        const point = res.data.find((p: PointInfo) => p.id_point === parseInt(idPoint));
        setPointInfo(point || null);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [idPoint]);

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return "Aucun status";
    if (status === "1") return "Nouveau";
    if (status === "11") return "En cours";
    if (status === "21") return "Terminé";
    return "Inconnu";
  };

  const getStatusColor = (status: string | undefined) => {
    if (status === "1") return "#3b82f6";
    if (status === "11") return "#f59e0b";
    if (status === "21") return "#10b981";
    return "#6b7280";
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #2b3769 0%, #202b51 100%)",
      }}>
        <div style={{
          background: "white",
          padding: "40px 60px",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}>
          <p style={{ fontSize: "18px", color: "#374151", margin: 0 }}>
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1f2850 0%, #18233c 100%)",
      padding: "40px 20px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {/* Bouton Retour */}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#374151",
            cursor: "pointer",
            marginBottom: "30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s",
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }}
        >
          <span style={{ fontSize: "20px" }}>←</span>
          Retour à la carte
        </button>

        {/* Carte d'informations du point */}
        {pointInfo && (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            marginBottom: "40px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "30px",
              flexWrap: "wrap",
              gap: "20px"
            }}>
              <div>
                <h1 style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#1f2937",
                  margin: "0 0 10px 0",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {pointInfo.nameplace}
                </h1>
                <p style={{
                  fontSize: "16px",
                  color: "#6b7280",
                  margin: 0
                }}>
                  Point #{pointInfo.id_point}
                </p>
              </div>
              
              <div style={{
                background: getStatusColor(pointInfo.status),
                color: "white",
                padding: "10px 20px",
                borderRadius: "30px",
                fontWeight: 600,
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}>
                
              </div>
            </div>

            {/* Grille d'informations */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}>
              <div style={{
                background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                padding: "20px",
                borderRadius: "12px",
                border: "2px solid #667eea30"
              }}>
                <p style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: "0 0 8px 0",
                  fontWeight: 600
                }}>
                  🏢 Entreprise
                </p>
                <p style={{
                  fontSize: "18px",
                  color: "#1f2937",
                  margin: 0,
                  fontWeight: 700
                }}>
                  {pointInfo.name_entreprise}
                </p>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #10b98115 0%, #059f6715 100%)",
                padding: "20px",
                borderRadius: "12px",
                border: "2px solid #10b98130"
              }}>
                <p style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: "0 0 8px 0",
                  fontWeight: 600
                }}>
                  📐 Surface
                </p>
                <p style={{
                  fontSize: "18px",
                  color: "#1f2937",
                  margin: 0,
                  fontWeight: 700
                }}>
                  {pointInfo.surface.toLocaleString()} m²
                </p>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #f59e0b15 0%, #d9770615 100%)",
                padding: "20px",
                borderRadius: "12px",
                border: "2px solid #f59e0b30"
              }}>
                <p style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: "0 0 8px 0",
                  fontWeight: 600
                }}>
                  💰 Budget
                </p>
                <p style={{
                  fontSize: "18px",
                  color: "#1f2937",
                  margin: 0,
                  fontWeight: 700
                }}>
                  {pointInfo.budget.toLocaleString()} Ariary
                </p>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #3b82f615 0%, #2563eb15 100%)",
                padding: "20px",
                borderRadius: "12px",
                border: "2px solid #3b82f630"
              }}>
                <p style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: "0 0 8px 0",
                  fontWeight: 600
                }}>
                  📍 Coordonnées
                </p>
                <p style={{
                  fontSize: "14px",
                  color: "#1f2937",
                  margin: 0,
                  fontWeight: 600,
                  lineHeight: 1.6
                }}>
                  Lat: {parseFloat(pointInfo.latitude).toFixed(6)}<br/>
                  Lng: {parseFloat(pointInfo.longitude).toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section des images */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            <h2 style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#1f2937",
              margin: 0
            }}>
              📸 Galerie Photos
            </h2>
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: 600
            }}>
              {images.length} image{images.length > 1 ? 's' : ''}
            </div>
          </div>

          {images.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "25px",
            }}>
              {images.map((img, index) => (
                <div 
                  key={index} 
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    transition: "all 0.3s",
                    cursor: "pointer",
                    background: "#f9fafb"
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
                  }}
                >
                  <img
                    src={img.base64}
                    alt={`${pointInfo?.nameplace || 'Point'} - Image ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "280px",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                  <div style={{
                    padding: "15px",
                    background: "white"
                  }}>
                    <p style={{
                      textAlign: "center",
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#374151"
                    }}>
                      Photo {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#9ca3af"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📷</div>
              <p style={{
                fontSize: "18px",
                fontWeight: 600,
                margin: "0 0 10px 0"
              }}>
                Aucune image disponible
              </p>
              <p style={{
                fontSize: "14px",
                margin: 0
              }}>
                Aucune photo n'a été ajoutée pour ce point
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImagePage;