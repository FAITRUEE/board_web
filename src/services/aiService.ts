const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface AIGenerationRequest {
  prompt: string;
  tone: string;
  length: string;
  emoji: string;
}

export interface AIGenerationResponse {
  title: string;
  content: string;
}

export const generatePost = async (request: AIGenerationRequest): Promise<AIGenerationResponse> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'AI 생성 실패' }));
    throw new Error(error.message || 'AI 생성에 실패했습니다.');
  }

  return response.json();
};