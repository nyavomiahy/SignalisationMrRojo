import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

// Définir le type pour une image
interface ImageItem {
  base64: string;
  // Ajoutez d'autres champs si votre table en a (ex: id, nom, etc.)
  // id?: number;
  // nom?: string;
  // created_at?: string;
}

function ImagePage() {
  const { idPoint } = useParams();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idPoint) return;

    axios
      .get(`http://localhost:5000/api/points/images/${idPoint}`)
      .then(res => {
        // Si l'API retourne un tableau
        if (Array.isArray(res.data)) {
          setImages(res.data);
        } 
        // Si l'API retourne un objet avec propriété "images"
        else if (res.data.images && Array.isArray(res.data.images)) {
          setImages(res.data.images);
        }
        // Pour compatibilité avec ancien format
        else if (res.data.base64) {
          setImages([res.data]);
        }
      })
      .catch(err => {
        console.error(err);
        setImages([]);
      })
      .finally(() => setLoading(false));
  }, [idPoint]);

  if (loading) return <p>Chargement des images…</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>Images du point #{idPoint}</h2>
      <p style={{ color: "#666" }}>
        {images.length} image(s) trouvée(s)
      </p>

      {images.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "20px"
        }}>
          {images.map((img, index) => (
            <div 
              key={index} 
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "15px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <img
                src={img.base64}
                alt={`Point ${idPoint} - Image ${index + 1}`}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  display: "block"
                }}
              />
              <p style={{
                textAlign: "center",
                marginTop: "10px",
                fontSize: "14px",
                color: "#555"
              }}>
                Image {index + 1}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#999", fontStyle: "italic" }}>
          Aucune image disponible pour ce point
        </p>
      )}
    </div>
  );
}

export default ImagePage;