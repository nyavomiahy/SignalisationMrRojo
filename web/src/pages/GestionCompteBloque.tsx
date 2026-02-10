// import { useEffect, useState } from "react";
// import {
//   getUsersWithStatus,
//   updateUserStatus,
// } from "../services/userStatusService";

// interface User {
//   id: number;
//   username: string;
//   email: string;
//   status: number; // 1 actif | 2 bloqué
//   description: string;
// }

// export default function GestionCompteBloque() {
//   const [users, setUsers] = useState<User[]>([]);

//   const fetchUsers = async () => {
//     const data = await getUsersWithStatus();
//     setUsers(data);
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleToggleStatus = async (user: User) => {
//     if (user.status === 1) {
//       await updateUserStatus(user.id, 2, "bloqué");
//     } else {
//       await updateUserStatus(user.id, 1, "actif");
//     }
//     fetchUsers();
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Gestion des comptes bloqués</h2>

//       <table border={1} cellPadding={10}>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Username</th>
//             <th>Email</th>
//             <th>Statut</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((u) => (
//             <tr key={u.id}>
//               <td>{u.id}</td>
//               <td>{u.username}</td>
//               <td>{u.email}</td>
//               <td
//                 style={{
//                   color: u.status === 2 ? "red" : "green",
//                   fontWeight: "bold",
//                 }}
//               >
//                 {u.status === 2 ? "Bloqué" : "Actif"}
//               </td>
//               <td>
//                 <button onClick={() => handleToggleStatus(u)}>
//                   {u.status === 1 ? "Bloquer" : "Débloquer"}
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import {
  getUsersWithStatus,
  updateUserStatus,
} from "../services/userStatusService";
import "./GestionCompteBloque.css"; // Import du CSS

interface User {
  id: number;
  username: string;
  email: string;
  status: number; // 1 actif | 2 bloqué
  description: string;
}

export default function GestionCompteBloque() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    user: User | null;
    action: "block" | "unblock";
  }>({ show: false, user: null, action: "block" });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersWithStatus();
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

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.status === 1) {
        await updateUserStatus(user.id, 2, "bloqué");
      } else {
        await updateUserStatus(user.id, 1, "actif");
      }
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  };

  const openConfirmation = (user: User) => {
    setConfirmAction({
      show: true,
      user,
      action: user.status === 1 ? "block" : "unblock"
    });
  };

  const closeConfirmation = () => {
    setConfirmAction({ show: false, user: null, action: "block" });
  };

  const confirmToggle = () => {
    if (confirmAction.user) {
      handleToggleStatus(confirmAction.user);
      closeConfirmation();
    }
  };

  const getStatusText = (status: number) => {
    return status === 1 ? "Actif" : "Bloqué";
  };

  return (
    <div className="gestion-bloque-container">
      <h2 className="gestion-bloque-header">Gestion des comptes bloqués</h2>

      {loading ? (
        <div className="loading-spinner">Chargement des utilisateurs...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>Aucun utilisateur trouvé.</p>
        </div>
      ) : (
        <table className="status-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <div className={`status-badge ${
                    u.status === 1 ? 'status-active' : 'status-blocked'
                  }`}>
                    <span className="status-indicator"></span>
                    {getStatusText(u.status)}
                  </div>
                </td>
                <td>
                  <div className="action-toggle">
                    <button
                      className={`btn-toggle ${
                        u.status === 1 ? 'btn-block' : 'btn-unblock'
                      }`}
                      onClick={() => openConfirmation(u)}
                    >
                      {u.status === 1 ? (
                        <>
                          <span>🚫</span> Bloquer
                        </>
                      ) : (
                        <>
                          <span>✅</span> Débloquer
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {confirmAction.show && confirmAction.user && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <div className="modal-header">
              <span>
                {confirmAction.action === "block" ? "🚫" : "✅"}
              </span>
              Confirmer l'action
            </div>
            <div className="modal-body">
              Êtes-vous sûr de vouloir {confirmAction.action === "block" ? "bloquer" : "débloquer"} l'utilisateur 
              <strong> {confirmAction.user.username}</strong> ?
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeConfirmation}>
                Annuler
              </button>
              <button className="btn-confirm" onClick={confirmToggle}>
                {confirmAction.action === "block" ? "Bloquer" : "Débloquer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}