import { apiClient } from './client';
import type { Token, User, UserCreate, UserLogin } from '../types/auth';

export const loginApi = async (credentials: UserLogin): Promise<Token> => {
  const response = await apiClient.post<Token>('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData: UserCreate): Promise<User> => {
  const response = await apiClient.post<User>('/auth/register', userData);
  return response.data;
};

export const getCurrentUserApi = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};
