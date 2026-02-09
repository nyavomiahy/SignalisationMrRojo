import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../../services/userService";
import { useNavigate } from "react-router-dom";

type User = {
  id: number;
  username: string;
  email: string;
  name_type: string;
};

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Supprimer cet utilisateur ?")) {
      await deleteUser(id);
      loadUsers();
    }
  };

  return (
    <table border={1} cellPadding={10} width="100%">
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
            <td>{u.name_type}</td>
            <td>
              <button onClick={() => navigate(`/users/edit/${u.id}`)}>
                Modifier
              </button>
              <button
                onClick={() => handleDelete(u.id)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserList;
