import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket, WS_URL } from './useWebSocket';
import { useAuth } from '../contexts/AuthContext';

export interface KanbanBoardEvent {
  boardId: number;
  cardId?: number;
  type:
    | 'CARD_CREATED'
    | 'CARD_UPDATED'
    | 'CARD_MOVED'
    | 'CARD_DELETED'
    | 'CHECKLIST_CHANGED'
    | 'COMMENT_CHANGED';
  status?: string;
  position?: number;
  userId: number;
  username: string;
  timestamp: number;
}

/**
 * 다른 사용자가 같은 보드에서 카드를 변경하면 보드 데이터를 다시 불러온다.
 * 서버는 REST로 변경이 저장된 뒤 /topic/kanban/{boardId}로 알림을 보낸다.
 */
export const useKanbanRealtime = (boardId: number) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isConnected, subscribe } = useWebSocket({ url: WS_URL, enabled: !!boardId });

  useEffect(() => {
    if (!isConnected || !boardId) return;

    return subscribe(`/topic/kanban/${boardId}`, (message) => {
      const event: KanbanBoardEvent = JSON.parse(message.body);
      // 내 변경은 이미 mutation에서 캐시를 갱신했으므로 무시
      if (event.userId === user?.id) return;

      queryClient.invalidateQueries({ queryKey: ['kanban-board', boardId] });
      if (event.type === 'COMMENT_CHANGED' && event.cardId) {
        queryClient.invalidateQueries({ queryKey: ['card-comments', boardId, event.cardId] });
      }
    });
  }, [isConnected, boardId, subscribe, queryClient, user?.id]);

  return { isConnected };
};
