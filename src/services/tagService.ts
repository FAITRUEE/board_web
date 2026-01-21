import { Tag } from '@/types/tag';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// ✅ 토큰 있을 때만 추가하도록 수정
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  
  // ✅ 토큰이 있을 때만 추가
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// 모든 태그 조회
export const getTags = async (): Promise<Tag[]> => {
  try {
    return await fetchAPI<Tag[]>('/tags');
  } catch (error) {
    console.warn('태그 조회 실패:', error);
    return [];  // ✅ 에러 시 빈 배열 반환
  }
};

// 인기 태그 조회
export const getPopularTags = async (): Promise<Tag[]> => {
  try {
    return await fetchAPI<Tag[]>('/tags/popular');
  } catch (error) {
    console.warn('인기 태그 조회 실패:', error);
    return [];  // ✅ 에러 시 빈 배열 반환
  }
};

// 태그 검색
export const searchTags = async (keyword: string): Promise<Tag[]> => {
  try {
    return await fetchAPI<Tag[]>(`/tags/search?keyword=${encodeURIComponent(keyword)}`);
  } catch (error) {
    console.warn('태그 검색 실패:', error);
    return [];  // ✅ 에러 시 빈 배열 반환
  }
};