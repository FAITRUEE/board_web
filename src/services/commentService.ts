import { Comment, CreateCommentRequest, UpdateCommentRequest, CommentListResponse } from '@/types/comment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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

// 댓글 목록 조회
export const getComments = async (postId: number): Promise<CommentListResponse> => {
  return fetchAPI<CommentListResponse>(`/posts/${postId}/comments`);
};

// 댓글 작성
export const createComment = async (postId: number, request: CreateCommentRequest): Promise<Comment> => {
  return fetchAPI<Comment>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// 댓글 수정
export const updateComment = async (postId: number, commentId: number, request: UpdateCommentRequest): Promise<Comment> => {
  return fetchAPI<Comment>(`/posts/${postId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
};

export const deleteComment = async (postId: number, commentId: number): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  // 204 No Content 응답이므로 JSON 파싱하지 않음
};