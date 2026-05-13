import { Post, CreatePostRequest, UpdatePostRequest, PostListResponse } from '@/types/post';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// ✅ 토큰 유효성 검사 함수
const getValidToken = (): string | null => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('⚠️ 토큰 없음');
    return null;
  }

  try {
    // JWT 토큰 기본 검증 (형식 체크)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ 잘못된 JWT 형식:', token.substring(0, 20));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    // Payload 디코딩하여 만료 시간 확인
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      console.error('❌ 토큰 만료:', new Date(payload.exp * 1000));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    console.log('✅ 유효한 토큰:', {
      sub: payload.sub,
      email: payload.email,
      exp: new Date(payload.exp * 1000)
    });

    return token;
  } catch (error) {
    console.error('❌ 토큰 검증 실패:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

// ✅ 인증 실패 처리 함수
const handleAuthError = () => {
  console.error('🔒 인증 실패 - 로그인 페이지로 이동');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/auth';
};

// API 요청 헬퍼 함수 (JWT 토큰 포함)
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getValidToken();
  
  console.log(`📡 API 요청: ${endpoint}`, {
    method: options?.method || 'GET',
    hasToken: !!token,
  });

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  console.log(`📨 응답: ${endpoint}`, {
    status: response.status,
    ok: response.ok,
  });

  // ✅ 401 에러 시 자동 로그아웃
  if (response.status === 401) {
    console.error('❌ 401 Unauthorized');
    handleAuthError();
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
  keyword?: string
): Promise<PostListResponse> => {
  let url = `/posts?page=${page}&size=${size}`;
  if (sort) url += `&sort=${sort}`;
  if (categoryId !== undefined) url += `&categoryId=${categoryId}`;
  if (tagName) url += `&tagName=${encodeURIComponent(tagName)}`;
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
  
  return fetchAPI<PostListResponse>(url);
};

export const getPost = async (id: number): Promise<Post> => {
  return fetchAPI<Post>(`/posts/${id}`);
};

export const createPost = async (request: CreatePostRequest): Promise<Post> => {
  const token = getValidToken();
  
  if (!token) {
    handleAuthError();
    throw new Error('로그인이 필요합니다.');
  }
  
  console.log('📝 게시글 작성 시작:', {
    title: request.title,
    hasFiles: !!request.files?.length,
    categoryId: request.categoryId,
    tags: request.tags,
  });

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

  if (request.isCollaborative !== undefined) {
    formData.append('isCollaborative', String(request.isCollaborative));
  }

  if (request.files && request.files.length > 0) {
    request.files.forEach(file => {
      formData.append('files', file);
    });
  }

  console.log('📤 FormData 전송 중...');

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // ✅ Content-Type 제거 (FormData는 자동 설정)
    },
    body: formData,
  });

  console.log(`📨 응답 상태: ${response.status}`);

  if (response.status === 401) {
    console.error('❌ 401 Unauthorized - createPost');
    handleAuthError();
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    console.error('❌ 게시글 작성 실패:', error);
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  console.log('✅ 게시글 작성 성공:', result.id);
  return result;
};

export const updatePost = async (id: number, request: UpdatePostRequest): Promise<Post> => {
  const token = getValidToken();
  
  if (!token) {
    handleAuthError();
    throw new Error('로그인이 필요합니다.');
  }
  
  console.log('✏️ 게시글 수정 시작:', id);
  
  return fetchAPI<Post>(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
};

export const deletePost = async (id: number): Promise<void> => {
  const token = getValidToken();
  
  if (!token) {
    handleAuthError();
    throw new Error('로그인이 필요합니다.');
  }
  
  console.log('🗑️ 게시글 삭제 시작:', id);

  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    console.error('❌ 401 Unauthorized - deletePost');
    handleAuthError();
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  console.log('✅ 게시글 삭제 성공');
};

export const incrementViews = async (id: number): Promise<void> => {
  const token = getValidToken();

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
  const token = getValidToken();
  
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