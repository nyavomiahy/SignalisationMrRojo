import axios from "axios";

const API_URL = "http://localhost:5000/api/prix";

/* GET : liste des prix */
export const getPrix = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

/* PUT : modifier un prix */
export const updatePrix = async (id: number, prix: number) => {
  await axios.put(`${API_URL}/${id}`, { prix });
};
