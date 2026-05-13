// src/hooks/useKanban.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:8080/api/kanban';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ✅ 체크리스트 아이템 타입
export interface ChecklistItem {
  id: number;
  text: string;
  completed: boolean;
  position: number;
}

// ✅ 타입 업데이트
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
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  commentCount: number;
  checklistTotal: number;
  checklistCompleted: number;
  checklistItems?: ChecklistItem[];
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

// ✅ 카드 업데이트 데이터 타입 정의
export interface UpdateCardData {
  title?: string;
  description?: string;
  assignedTo?: number;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; // ✅ string 대신 명시적 타입
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

// ✅ 카드 생성
export const useCreateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, data }: { 
      boardId: number; 
      data: { 
        title: string; 
        description: string; 
        status?: string;
        assignedTo?: number;
        dueDate?: string;
        priority?: string;
      } 
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

// ✅ 카드 수정 - 타입 에러 해결
export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, cardId, data }: { 
      boardId: number; 
      cardId: number; 
      data: UpdateCardData; // ✅ 명시적 타입 사용
    }) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/cards/${cardId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update card');
      return response.json() as Promise<KanbanCard>; // ✅ 반환 타입 명시
    },
    onMutate: async ({ boardId, cardId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['kanban-board', boardId] });

      const previousBoard = queryClient.getQueryData<KanbanBoard>(['kanban-board', boardId]);

      // ✅ 낙관적 업데이트 - 타입 안전하게
      queryClient.setQueryData<KanbanBoard>(['kanban-board', boardId], (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards?.map(card =>
            card.id === cardId 
              ? { 
                  ...card, 
                  ...data,
                  // ✅ assignedTo를 assignedToId로 변환
                  assignedToId: data.assignedTo !== undefined ? data.assignedTo : card.assignedToId,
                } as KanbanCard // ✅ 타입 단언
              : card
          ),
        };
      });

      return { previousBoard };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['kanban-board', variables.boardId], context.previousBoard);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<KanbanBoard>(['kanban-board', variables.boardId], (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards?.map(card => 
            card.id === variables.cardId ? data : card
          ),
        };
      });
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

// ✅ 체크리스트 아이템 삭제 - 순서 조정
export const useDeleteChecklistItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, cardId, itemId }: { 
      boardId: number; 
      cardId: number; 
      itemId: number 
    }) => {
      console.log('🗑️ 체크리스트 삭제 요청:', { boardId, cardId, itemId });
      
      const response = await fetch(`${API_URL}/boards/${boardId}/cards/${cardId}/checklist/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      
      console.log('🗑️ 삭제 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 체크리스트 삭제 실패:', errorText);
        throw new Error('Failed to delete checklist item');
      }
      
      const result = await response.json();
      console.log('✅ 삭제 성공:', result);
      return result as KanbanCard;
    },
    // ✅ onMutate 제거 - 낙관적 업데이트 없이 서버 응답만 사용
    onSuccess: (updatedCard, variables) => {
      console.log('💾 캐시 업데이트 중...', updatedCard);
      
      // 서버에서 받은 최신 카드 데이터로 캐시 직접 업데이트
      queryClient.setQueryData<KanbanBoard>(['kanban-board', variables.boardId], (old) => {
        if (!old) return old;
        
        const newBoard = {
          ...old,
          cards: old.cards?.map(card => 
            card.id === variables.cardId ? updatedCard : card
          ),
        };
        
        console.log('✅ 캐시 업데이트 완료:', newBoard);
        return newBoard;
      });
    },
    onError: (error) => {
      console.error('❌ 체크리스트 삭제 에러:', error);
      alert('체크리스트 항목 삭제에 실패했습니다.');
    },
  });
};

// ✅ 체크리스트 아이템 토글도 동일하게 수정
export const useToggleChecklistItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, cardId, itemId }: { 
      boardId: number; 
      cardId: number; 
      itemId: number 
    }) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/cards/${cardId}/checklist/${itemId}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeader(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('체크리스트 토글 실패:', errorText);
        throw new Error('Failed to toggle checklist item');
      }
      return response.json() as Promise<KanbanCard>;
    },
    // ✅ 낙관적 업데이트만 사용 (빠른 반응)
    onMutate: async ({ boardId, cardId, itemId }) => {
      await queryClient.cancelQueries({ queryKey: ['kanban-board', boardId] });

      const previousBoard = queryClient.getQueryData<KanbanBoard>(['kanban-board', boardId]);

      queryClient.setQueryData<KanbanBoard>(['kanban-board', boardId], (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards?.map(card => {
            if (card.id === cardId) {
              const updatedItems = card.checklistItems?.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              );
              const completedCount = updatedItems?.filter(i => i.completed).length || 0;
              return {
                ...card,
                checklistItems: updatedItems,
                checklistCompleted: completedCount,
              };
            }
            return card;
          }),
        };
      });

      return { previousBoard };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['kanban-board', variables.boardId], context.previousBoard);
      }
    },
    onSuccess: (updatedCard, variables) => {
      // 서버 응답으로 최종 확인
      queryClient.setQueryData<KanbanBoard>(['kanban-board', variables.boardId], (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards?.map(card => 
            card.id === variables.cardId ? updatedCard : card
          ),
        };
      });
    },
  });
};

// 댓글 타입
export interface CardComment {
  id: number;
  cardId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

// 카드 댓글 목록 조회
export const useCardComments = (boardId: number, cardId: number) => {
  return useQuery({
    queryKey: ['card-comments', boardId, cardId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/boards/${boardId}/cards/${cardId}/comments`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json() as Promise<CardComment[]>;
    },
    enabled: !!boardId && !!cardId,
  });
};

// 댓글 추가
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, cardId, content }: { boardId: number; cardId: number; content: string }) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/cards/${cardId}/comments`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json() as Promise<CardComment>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['card-comments', variables.boardId, variables.cardId] });
      queryClient.invalidateQueries({ queryKey: ['kanban-board', variables.boardId] });
    },
  });
};

// 댓글 삭제
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, cardId, commentId }: { boardId: number; cardId: number; commentId: number }) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/cards/${cardId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to delete comment');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['card-comments', variables.boardId, variables.cardId] });
      queryClient.invalidateQueries({ queryKey: ['kanban-board', variables.boardId] });
    },
  });
};

// ✅ 체크리스트 추가도 동일하게
export const useAddChecklistItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, cardId, text }: { 
      boardId: number; 
      cardId: number; 
      text: string 
    }) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/cards/${cardId}/checklist`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('체크리스트 추가 실패:', errorText);
        throw new Error('Failed to add checklist item');
      }
      return response.json() as Promise<KanbanCard>;
    },
    onSuccess: (updatedCard, variables) => {
      // 서버 응답으로 직접 업데이트
      queryClient.setQueryData<KanbanBoard>(['kanban-board', variables.boardId], (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards?.map(card => 
            card.id === variables.cardId ? updatedCard : card
          ),
        };
      });
    },
  });
};