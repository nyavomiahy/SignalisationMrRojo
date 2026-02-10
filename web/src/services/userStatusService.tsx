import axios from "axios";

const API_URL = "http://localhost:5000/api/users-status";

export const getUsersWithStatus = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const updateUserStatus = async (
  id: number,
  status: number,
  description: string
) => {
  await axios.post(`${API_URL}/${id}/status`, {
    status,
    description,
  });
};
