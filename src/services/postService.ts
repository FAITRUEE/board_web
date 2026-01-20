import { Post, CreatePostRequest, UpdatePostRequest, PostListResponse } from '@/types/post';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// API 요청 헬퍼 함수 (JWT 토큰 포함)
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

// 게시글 목록 조회
export const getPosts = async (page: number = 0, size: number = 10): Promise<PostListResponse> => {
  return fetchAPI<PostListResponse>(`/posts?page=${page}&size=${size}`);
};

// 게시글 상세 조회
export const getPost = async (id: number): Promise<Post> => {
  return fetchAPI<Post>(`/posts/${id}`);
};

// 게시글 작성
export const createPost = async (request: CreatePostRequest): Promise<Post> => {
  return fetchAPI<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// 게시글 수정
export const updatePost = async (id: number, request: UpdatePostRequest): Promise<Post> => {
  return fetchAPI<Post>(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
};

// 게시글 삭제
export const deletePost = async (id: number): Promise<void> => {
  return fetchAPI<void>(`/posts/${id}`, {
    method: 'DELETE',
  });
};

// 조회수 증가
export const incrementViews = async (id: number): Promise<void> => {
  return fetchAPI<void>(`/posts/${id}/views`, {
    method: 'POST',
  });
};