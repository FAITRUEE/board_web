import { CollabRoom, CreateCollabRoomRequest, UpdateCollabRoomContentRequest, PublishCollabRoomRequest } from '@/types/collabRoom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getMyCollabRooms = async (): Promise<CollabRoom[]> => {
  const res = await fetch(`${API_BASE_URL}/collab-rooms`, { headers: authHeaders() });
  if (!res.ok) throw new Error('공동 편집 방 목록을 불러오지 못했습니다.');
  return res.json();
};

export const getCollabRoom = async (roomId: number): Promise<CollabRoom> => {
  const res = await fetch(`${API_BASE_URL}/collab-rooms/${roomId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('공동 편집 방을 찾을 수 없습니다.');
  return res.json();
};

export const createCollabRoom = async (request: CreateCollabRoomRequest): Promise<CollabRoom> => {
  const res = await fetch(`${API_BASE_URL}/collab-rooms`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('공동 편집 방 생성에 실패했습니다.');
  return res.json();
};

export const updateCollabRoomContent = async (
  roomId: number,
  request: UpdateCollabRoomContentRequest
): Promise<CollabRoom> => {
  const res = await fetch(`${API_BASE_URL}/collab-rooms/${roomId}/content`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('내용 저장에 실패했습니다.');
  return res.json();
};

export const publishCollabRoom = async (
  roomId: number,
  request: PublishCollabRoomRequest
): Promise<{ postId: number }> => {
  const res = await fetch(`${API_BASE_URL}/collab-rooms/${roomId}/publish`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('게시글 발행에 실패했습니다.');
  return res.json();
};

export const deleteCollabRoom = async (roomId: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/collab-rooms/${roomId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('방 삭제에 실패했습니다.');
};
