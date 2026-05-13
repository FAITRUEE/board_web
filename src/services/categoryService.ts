import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

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

// 카테고리 목록 조회
export const getCategories = async (): Promise<Category[]> => {
  try {
    return await fetchAPI<Category[]>('/categories');
  } catch (error) {
    console.warn('카테고리 조회 실패:', error);
    return [];  // ✅ 에러 시 빈 배열 반환
  }
};

// 카테고리 상세 조회
export const getCategory = async (id: number): Promise<Category> => {
  return fetchAPI<Category>(`/categories/${id}`);
};

// 카테고리 생성
export const createCategory = async (request: CreateCategoryRequest): Promise<Category> => {
  return fetchAPI<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// 카테고리 수정
export const updateCategory = async (id: number, request: UpdateCategoryRequest): Promise<Category> => {
  return fetchAPI<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
};

// 카테고리 삭제
export const deleteCategory = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
};