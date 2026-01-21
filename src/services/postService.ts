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
export const getPosts = async (
  page: number = 0, 
  size: number = 10, 
  sort?: string,
  categoryId?: number  // ✅ 추가
): Promise<PostListResponse> => {
  let url = `/posts?page=${page}&size=${size}`;
  if (sort) {
    url += `&sort=${sort}`;
  }
  // ✅ 카테고리 필터 추가
  if (categoryId !== undefined) {
    url += `&categoryId=${categoryId}`;
  }
  return fetchAPI<PostListResponse>(url);
};

// 게시글 상세 조회
export const getPost = async (id: number): Promise<Post> => {
  return fetchAPI<Post>(`/posts/${id}`);
};

// 게시글 작성 (파일 업로드 포함)
export const createPost = async (request: CreatePostRequest): Promise<Post> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  
  formData.append('title', request.title);
  formData.append('content', request.content);
  
  // 카테고리 ID 추가
  if (request.categoryId !== undefined) {
    formData.append('categoryId', String(request.categoryId));
  }
  
  // 비밀글 정보 추가
  if (request.isSecret !== undefined) {
    formData.append('isSecret', String(request.isSecret));
  }
  
  if (request.secretPassword) {
    formData.append('secretPassword', request.secretPassword);
  }
  
  // 파일 추가
  if (request.files && request.files.length > 0) {
    request.files.forEach(file => {
      formData.append('files', file);
    });
  }

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
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
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
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

// 조회수 증가
export const incrementViews = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/posts/${id}/views`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
};

// 좋아요 토글
export const toggleLike = async (id: number): Promise<{ isLiked: boolean; likeCount: number }> => {
  return fetchAPI<{ isLiked: boolean; likeCount: number }>(`/posts/${id}/like`, {
    method: 'POST',
  });
};

// 첨부파일 다운로드
export const downloadAttachment = (fileName: string): string => {
  return `${API_BASE_URL}/posts/attachments/${fileName}`;
};

// 비밀글 비밀번호 확인
export const verifySecretPost = async (id: number, password: string): Promise<Post> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/posts/${id}/verify-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '비밀번호가 일치하지 않습니다.' }));
    throw new Error(error.message || '비밀번호 확인 실패');
  }

  return response.json();
};