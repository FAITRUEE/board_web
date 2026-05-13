import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyCollabRooms,
  getCollabRoom,
  createCollabRoom,
  updateCollabRoomContent,
  publishCollabRoom,
  deleteCollabRoom,
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
    onSuccess: (_, { roomId }) =>
      queryClient.invalidateQueries({ queryKey: ['collab-room', roomId] }),
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
