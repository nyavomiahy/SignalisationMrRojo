// import { useEffect, useState } from "react";
// import { getUsers, deleteUser } from "../services/userService";
// import { useNavigate } from "react-router-dom";

// interface User {
//   id: number;
//   username: string;
//   email: string;
//   name_type: string;
// }

// export default function GestionCompte() {
//   const [users, setUsers] = useState<User[]>([]);
//   const navigate = useNavigate();

//   // Récupération des utilisateurs
//   const fetchUsers = async () => {
//     const data = await getUsers();
//     setUsers(data);
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleDelete = async (id: number) => {
//     if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
//       await deleteUser(id);
//       fetchUsers(); // rafraîchir la liste
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Gestion des utilisateurs</h2>
//       <table border={1} cellPadding={10} cellSpacing={0}>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Username</th>
//             <th>Email</th>
//             <th>Type</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((u) => (
//             <tr key={u.id}>
//               <td>{u.id}</td>
//               <td>{u.username}</td>
//               <td>{u.email}</td>
//               <td>{u.name_type}</td>
//               <td>
//                 <button onClick={() => navigate(`/users/edit/${u.id}`)}>Modifier</button>{" "}
//                 <button onClick={() => handleDelete(u.id)}>Supprimer</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../services/userService";
import { useNavigate } from "react-router-dom";
import "./GestionCompte.css"; // Import du CSS

interface User {
  id: number;
  username: string;
  email: string;
  name_type: string;
}

export default function GestionCompte() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      await deleteUser(id);
      fetchUsers();
    }
  };

  return (
    <div className="gestion-compte-container">
      <h2 className="gestion-compte-header">Gestion des utilisateurs</h2>
      
      {loading ? (
        <div className="loading-spinner">Chargement...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>Aucun utilisateur trouvé.</p>
        </div>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span className="type-badge">{u.name_type}</span>
                </td>
                <td>
                  <div className="actions-container">
                    <button 
                      className="btn btn-edit"
                      onClick={() => navigate(`/users/edit/${u.id}`)}
                    >
                      <span>✏️</span> Modifier
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={() => handleDelete(u.id)}
                    >
                      <span>🗑️</span> Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>        
      )}
      <button
            className="btn-cancel"
            type="button"
            onClick={() => navigate("/dashboard")}
          ><span>↩️</span> Retour</button>
    </div>
  );
}