import { useEffect, useRef, useCallback, useState } from 'react';
import { useWebSocket, WS_URL } from './useWebSocket';
import { useAuth } from '../contexts/AuthContext';

export interface ActiveEditor {
  userId: number;
  username: string;
}

export interface RoomEditMessage {
  postId: number;
  userId: number;
  username: string;
  type: 'JOIN' | 'LEAVE' | 'CONTENT_CHANGE' | 'CURSOR_MOVE' | 'SAVE';
  content?: string;
  timestamp: number;
  editors?: ActiveEditor[]; // JOIN / LEAVE 시 서버가 보내주는 현재 편집자 전체 목록
}

interface UseCollabRoomEditProps {
  roomId: number;
  onRemoteContentChange: (content: string) => void;
}

export const useCollabRoomEdit = ({ roomId, onRemoteContentChange }: UseCollabRoomEditProps) => {
  const { user } = useAuth();
  const [activeEditors, setActiveEditors] = useState<ActiveEditor[]>([]);

  const isRemoteUpdateRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onRemoteRef = useRef(onRemoteContentChange);
  onRemoteRef.current = onRemoteContentChange;

  const { isConnected, subscribe, publish } = useWebSocket({ url: WS_URL });

  useEffect(() => {
    if (!isConnected || !user) return;

    const unsubscribe = subscribe(`/topic/collab-room/${roomId}`, (message) => {
      const data: RoomEditMessage = JSON.parse(message.body);

      // 편집자 목록은 서버 기준으로 통째로 교체 (늦게 들어온 사람도 기존 편집자를 볼 수 있음)
      if (data.editors) {
        setActiveEditors(data.editors.filter((e) => e.userId !== user.id));
      }

      if (data.type === 'CONTENT_CHANGE' && data.userId !== user.id && data.content !== undefined) {
        isRemoteUpdateRef.current = true;
        onRemoteRef.current(data.content);
      }
    });

    publish(`/app/collab-room/${roomId}/edit`, {
      type: 'JOIN',
      userId: user.id,
      username: user.username,
    });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      publish(`/app/collab-room/${roomId}/edit`, {
        type: 'LEAVE',
        userId: user.id,
        username: user.username,
      });
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, roomId]);

  const broadcastContentChange = useCallback(
    (content: string) => {
      // 원격 업데이트로 인한 상태 변경은 다시 브로드캐스트하지 않음
      if (isRemoteUpdateRef.current) {
        isRemoteUpdateRef.current = false;
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (!user) return;
        publish(`/app/collab-room/${roomId}/edit`, {
          type: 'CONTENT_CHANGE',
          userId: user.id,
          username: user.username,
          content,
        });
      }, 300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publish, roomId, user]
  );

  return { isConnected, activeEditors, broadcastContentChange };
};
