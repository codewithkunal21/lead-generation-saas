export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  username: string;
  full_name?: string;
  password: string;
}

export interface UserLogin {
  username_or_email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}
