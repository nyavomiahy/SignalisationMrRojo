import { useEffect, useState } from "react";
import axios from "axios";
import "./ParametrePrix.css"; // Import du CSS

type Prix = {
  id_prix: number;
  prix: string;
  date: string;
};

export default function ParametrePrix() {
  const [prixList, setPrixList] = useState<Prix[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedPrix, setEditedPrix] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  // Récupérer les prix
  const fetchPrix = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/prix");
      setPrixList(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des prix:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrix();
  }, []);

  // Cliquer sur Modifier
  const handleEdit = (p: Prix) => {
    setEditingId(p.id_prix);
    setEditedPrix(Number(p.prix));
    setSuccessMessage("");
  };

  // Cliquer sur Sauvegarder
  const handleSave = async () => {
    if (editingId === null) return;

    try {
      await axios.put(
        `http://localhost:5000/api/prix/update/${editingId}`,
        { prix_m2: editedPrix }
      );
      
      setSuccessMessage("Prix mis à jour avec succès !");
      setEditingId(null);
      fetchPrix();
      
      // Masquer le message après 3 secondes
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      alert("Erreur lors de la mise à jour du prix");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const getCurrentPrice = () => {
    if (prixList.length === 0) return 0;
    return Number(prixList[prixList.length - 1].prix);
  };

  return (
    <div className="parametre-prix-container">
      <h2 className="prix-header">Historique des prix au m²</h2>
      
      {successMessage && (
        <div className="success-message">
          <span>✅</span> {successMessage}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des données de prix...</p>
        </div>
      ) : prixList.length === 0 ? (
        <div className="empty-state">
          <p>Aucun prix enregistré pour le moment.</p>
        </div>
      ) : (
        <>
          <table className="prix-table">
            <thead>
              <tr>
                <th>Date de modification</th>
                <th>Prix au m² (Ar)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prixList.map((p) => (
                <tr key={p.id_prix}>
                  <td className="prix-date">
                    {new Date(p.date).toLocaleDateString("fr-FR", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td>
                    {editingId === p.id_prix ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          className="prix-input"
                          type="number"
                          value={editedPrix}
                          onChange={(e) => setEditedPrix(Number(e.target.value))}
                          min="0"
                          step="100"
                        />
                        <span className="currency-symbol">Ar</span>
                      </div>
                    ) : (
                      <div className="prix-value">
                        {formatPrice(Number(p.prix))}
                        <span className="currency-symbol">Ar</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="prix-actions">
                      {editingId === p.id_prix ? (
                        <button className="btn-action btn-save" onClick={handleSave}>
                          <span>💾</span> Sauvegarder
                        </button>
                      ) : (
                        <button className="btn-action btn-edit" onClick={() => handleEdit(p)}>
                          <span>✏️</span> Modifier
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {prixList.length > 0 && (
            <div className="current-price-card">
              <div className="current-price-label">
                Prix actuel au mètre carré
              </div>
              <div className="current-price-value">
                {formatPrice(getCurrentPrice())}
                <span className="current-price-currency">Ar</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}