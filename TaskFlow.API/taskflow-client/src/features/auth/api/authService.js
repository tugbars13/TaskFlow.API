import api from "@/api/client/axios";
import { AUTH_ENDPOINTS } from "@/features/auth/constants/auth.constants";

export const loginRequest = async (credentials) => {
  const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);

  return response.data;
};

export const registerRequest = async (user) => {
  const response = await api.post(AUTH_ENDPOINTS.REGISTER, user);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get(AUTH_ENDPOINTS.CURRENT_USER);

  return response.data;
};

export const deleteAccount = async () => {
  // Using the /api/auth/me endpoint we created in AuthController
  const response = await api.delete('/auth/me');
  return response.data;
};
