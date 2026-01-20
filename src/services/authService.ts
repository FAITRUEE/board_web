import { LoginRequest, SignupRequest, AuthResponse, User, TokenPayload } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 로그인
export const login = async (request: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '로그인에 실패했습니다.' }));
    throw new Error(error.message);
  }

  return response.json();
};

// 회원가입
export const signup = async (request: SignupRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '회원가입에 실패했습니다.' }));
    throw new Error(error.message);
  }

  return response.json();
};

// 토큰 저장
export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

// 토큰 가져오기
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 토큰 삭제
export const removeToken = () => {
  localStorage.removeItem('token');
};

// JWT 디코딩
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// 토큰 유효성 검사
export const isTokenValid = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload) return false;
  
  const now = Date.now() / 1000;
  return payload.exp > now;
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = (): User | null => {
  const token = getToken();
  if (!token || !isTokenValid(token)) {
    removeToken();
    return null;
  }

  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    id: parseInt(payload.sub),
    email: payload.email,
    username: payload.username,
  };
};