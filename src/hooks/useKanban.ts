// src/hooks/useKanban.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';  // ✅ 수정

const API_URL = 'http://localhost:8080/api/kanban';

// 토큰 가져오기
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// 타입 정의
export interface KanbanCard {
  id: number;
  boardId: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  position: number;
  assignedToId?: number;
  assignedToUsername?: string;
  createdById: number;
  createdByUsername: string;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanBoard {
  id: number;
  teamId: number;
  teamName: string;
  name: string;
  description: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
  cards?: KanbanCard[];
}

// 칸반 보드 조회 (카드 포함)
export const useKanbanBoard = (boardId: number) => {
  return useQuery({
    queryKey: ['kanban-board', boardId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/boards/${boardId}`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch board');
      return response.json() as Promise<KanbanBoard>;
    },
    enabled: !!boardId,
  });
};

// 내 칸반 보드 목록 조회
export const useMyBoards = () => {
  return useQuery({
    queryKey: ['my-kanban-boards'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/boards/my`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch boards');
      return response.json() as Promise<KanbanBoard[]>;
    },
  });
};

// 칸반 보드 생성
export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { teamId: number; name: string; description: string }) => {
      const response = await fetch(`${API_URL}/boards`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create board');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-kanban-boards'] });
    },
  });
};

// 칸반 카드 생성
export const useCreateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, data }: { 
      boardId: number; 
      data: { title: string; description: string; status?: string } 
    }) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/cards`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create card');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board', variables.boardId] });
    },
  });
};

// 칸반 카드 이동
export const useMoveCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, cardId, status, position }: { 
      boardId: number; 
      cardId: number; 
      status: string; 
      position: number 
    }) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/cards/${cardId}/move`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ status, position }),
      });
      if (!response.ok) throw new Error('Failed to move card');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board', variables.boardId] });
    },
  });
};

// 칸반 카드 수정
export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, cardId, data }: { 
      boardId: number; 
      cardId: number; 
      data: { title?: string; description?: string; assignedTo?: number } 
    }) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/cards/${cardId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update card');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board', variables.boardId] });
    },
  });
};

// 칸반 카드 삭제
export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, cardId }: { boardId: number; cardId: number }) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/cards/${cardId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to delete card');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board', variables.boardId] });
    },
  });
};