import { useEffect, useRef, useCallback, useState } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '../contexts/AuthContext';

const WS_URL = 'http://localhost:8080/ws';

export interface ActiveEditor {
  userId: number;
  username: string;
  lastSeen: number;
}

export interface RoomEditMessage {
  postId: number;
  userId: number;
  username: string;
  type: 'JOIN' | 'LEAVE' | 'CONTENT_CHANGE' | 'CURSOR_MOVE' | 'SAVE';
  content?: string;
  timestamp: number;
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
      if (data.userId === user.id) return;

      switch (data.type) {
        case 'JOIN':
          setActiveEditors((prev) =>
            prev.some((e) => e.userId === data.userId)
              ? prev.map((e) =>
                  e.userId === data.userId ? { ...e, lastSeen: data.timestamp } : e
                )
              : [...prev, { userId: data.userId, username: data.username, lastSeen: data.timestamp }]
          );
          break;
        case 'LEAVE':
          setActiveEditors((prev) => prev.filter((e) => e.userId !== data.userId));
          break;
        case 'CONTENT_CHANGE':
          if (data.content !== undefined) {
            isRemoteUpdateRef.current = true;
            onRemoteRef.current(data.content);
          }
          break;
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
