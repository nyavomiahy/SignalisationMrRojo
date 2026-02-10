import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

/*  GET : liste des utilisateurs */
export const getUsers = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

/* DELETE : supprimer utilisateur */
export const deleteUser = async (id: number) => {
  await axios.delete(`${API_URL}/${id}`);
};

/* PUT : modifier utilisateur*/
export const updateUser = async (
  id: number,
  user: {
    username: string;
    email: string;
    id_type_account: number;
  }
) => {
  await axios.put(`${API_URL}/${id}`, user);
};
