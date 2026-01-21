import { Tag } from '@/types/tag';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// API 요청 헬퍼 함수
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// 모든 태그 조회
export const getTags = async (): Promise<Tag[]> => {
  return fetchAPI<Tag[]>('/tags');
};

// 인기 태그 조회 (상위 20개)
export const getPopularTags = async (): Promise<Tag[]> => {
  return fetchAPI<Tag[]>('/tags/popular');
};

// 태그 검색
export const searchTags = async (keyword: string): Promise<Tag[]> => {
  return fetchAPI<Tag[]>(`/tags/search?keyword=${encodeURIComponent(keyword)}`);
};