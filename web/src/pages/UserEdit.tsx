import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUsers, updateUser } from "../services/userService";
import "./UserEdit.css"; // Import du CSS

function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [idTypeAccount, setIdTypeAccount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const users = await getUsers();
        const user = users.find((u: any) => u.id === Number(id));
        
        if (user) {
          setUsername(user.username);
          setEmail(user.email);
          setIdTypeAccount(user.id_type_account || 1);
        } else {
          setError("Utilisateur non trouvé");
          setTimeout(() => navigate("/gestion-compte"), 2000);
        }
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(Number(id), {
        username,
        email,
        id_type_account: idTypeAccount,
      });
      setSuccess("Utilisateur mis à jour avec succès !");
      setTimeout(() => navigate("/gestion-compte"), 1500);
    } catch (err) {
      setError("Erreur lors de la mise à jour");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="user-edit-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des données utilisateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-edit-container">
      <h2 className="user-edit-header">Modifier utilisateur</h2>
      
      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <span>✅</span> {success}
        </div>
      )}

      <form className="edit-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="form-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Entrez le nom d'utilisateur"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Entrez l'adresse email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Type de compte</label>
          <select
            className="form-select"
            value={idTypeAccount}
            onChange={(e) => setIdTypeAccount(Number(e.target.value))}
          >
            <option value={1}>Administrateur</option>
            <option value={2}>Utilisateur standard</option>
          </select>
        </div>

        <div className="form-actions">
          <button className="btn-submit" type="submit">
            <span>💾</span> Enregistrer les modifications
          </button>
          <button
            className="btn-cancel"
            type="button"
            onClick={() => navigate("/gestion-compte")}
          >
            <span>↩️</span> Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserEdit;