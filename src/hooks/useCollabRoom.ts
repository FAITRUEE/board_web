import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyCollabRooms,
  getCollabRoom,
  createCollabRoom,
  updateCollabRoomContent,
  publishCollabRoom,
  deleteCollabRoom,
  getCollabRoomHistory,
  createCollabRoomSnapshot,
  restoreCollabRoomSnapshot,
} from '@/services/collabRoomService';
import { CreateCollabRoomRequest, PublishCollabRoomRequest, UpdateCollabRoomContentRequest } from '@/types/collabRoom';

export const useCollabRooms = () =>
  useQuery({ queryKey: ['collab-rooms'], queryFn: getMyCollabRooms });

export const useCollabRoom = (roomId: number) =>
  useQuery({
    queryKey: ['collab-room', roomId],
    queryFn: () => getCollabRoom(roomId),
    enabled: !!roomId,
  });

export const useCreateCollabRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateCollabRoomRequest) => createCollabRoom(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collab-rooms'] }),
  });
};

export const useUpdateCollabRoomContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, req }: { roomId: number; req: UpdateCollabRoomContentRequest }) =>
      updateCollabRoomContent(roomId, req),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['collab-room', roomId] });
      queryClient.invalidateQueries({ queryKey: ['collab-room-history', roomId] });
    },
  });
};

export const usePublishCollabRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, req }: { roomId: number; req: PublishCollabRoomRequest }) =>
      publishCollabRoom(roomId, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collab-rooms'] }),
  });
};

export const useDeleteCollabRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: number) => deleteCollabRoom(roomId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collab-rooms'] }),
  });
};

export const useCollabRoomHistory = (roomId: number, enabled: boolean) =>
  useQuery({
    queryKey: ['collab-room-history', roomId],
    queryFn: () => getCollabRoomHistory(roomId),
    enabled: !!roomId && enabled,
  });

export const useCreateCollabRoomSnapshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, description }: { roomId: number; description?: string }) =>
      createCollabRoomSnapshot(roomId, description),
    onSuccess: (_, { roomId }) =>
      queryClient.invalidateQueries({ queryKey: ['collab-room-history', roomId] }),
  });
};

export const useRestoreCollabRoomSnapshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, historyId }: { roomId: number; historyId: number }) =>
      restoreCollabRoomSnapshot(roomId, historyId),
    onSuccess: (room, { roomId }) => {
      queryClient.setQueryData(['collab-room', roomId], room);
      queryClient.invalidateQueries({ queryKey: ['collab-room-history', roomId] });
    },
  });
};
