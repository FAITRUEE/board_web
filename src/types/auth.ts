export interface User {
  id: number;
  email: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TokenPayload {
  sub: string; // user id
  email: string;
  username: string;
  exp: number;
  iat: number;
}