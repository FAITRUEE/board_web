export interface CollabRoom {
  id: number;
  teamId: number;
  teamName: string;
  createdById: number;
  createdByUsername: string;
  title: string;
  content: string;
  isPublished: boolean;
  publishedPostId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollabRoomRequest {
  teamId: number;
  title?: string;
}

export interface UpdateCollabRoomContentRequest {
  title?: string;
  content?: string;
}

export interface PublishCollabRoomRequest {
  categoryId?: number;
  tags?: string[];
}

export interface EditHistoryEntry {
  id: number;
  roomId: number;
  userId: number;
  username: string;
  title: string;
  content: string;
  changeDescription?: string;
  createdAt: string;
}
