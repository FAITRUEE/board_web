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

  // ✅ 401 에러 시 자동 로그아웃
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';  // ✅ /login → /auth
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const getPosts = async (
  page: number = 0, 
  size: number = 10, 
  sort?: string,
  categoryId?: number,
  tagName?: string,
  keyword?: string  // ✅ 추가
): Promise<PostListResponse> => {
  let url = `/posts?page=${page}&size=${size}`;
  if (sort) {
    url += `&sort=${sort}`;
  }
  if (categoryId !== undefined) {
    url += `&categoryId=${categoryId}`;
  }
  if (tagName) {
    url += `&tagName=${encodeURIComponent(tagName)}`;
  }
  if (keyword) {  // ✅ 추가
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }
  return fetchAPI<PostListResponse>(url);
};

export const getPost = async (id: number): Promise<Post> => {
  return fetchAPI<Post>(`/posts/${id}`);
};

export const createPost = async (request: CreatePostRequest): Promise<Post> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/auth';  // ✅ /login → /auth
    throw new Error('로그인이 필요합니다.');
  }
  
  const formData = new FormData();
  
  formData.append('title', request.title);
  formData.append('content', request.content);
  
  if (request.categoryId !== undefined) {
    formData.append('categoryId', String(request.categoryId));
  }
  
  if (request.tags && request.tags.length > 0) {
    request.tags.forEach(tag => {
      formData.append('tags', tag);
    });
  }
  
  if (request.isSecret !== undefined) {
    formData.append('isSecret', String(request.isSecret));
  }
  
  if (request.secretPassword) {
    formData.append('secretPassword', request.secretPassword);
  }
  
  if (request.files && request.files.length > 0) {
    request.files.forEach(file => {
      formData.append('files', file);
    });
  }

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';  // ✅ /login → /auth
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const updatePost = async (id: number, request: UpdatePostRequest): Promise<Post> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/auth';  // ✅ /login → /auth
    throw new Error('로그인이 필요합니다.');
  }
  
  return fetchAPI<Post>(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
};

export const deletePost = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/auth';  // ✅ /login → /auth
    throw new Error('로그인이 필요합니다.');
  }
  
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';  // ✅ /login → /auth
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
};

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

export const toggleLike = async (id: number): Promise<{ isLiked: boolean; likeCount: number }> => {
  return fetchAPI<{ isLiked: boolean; likeCount: number }>(`/posts/${id}/like`, {
    method: 'POST',
  });
};

export const downloadAttachment = (fileName: string): string => {
  return `${API_BASE_URL}/posts/attachments/${fileName}`;
};

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