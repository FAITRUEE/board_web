// src/hooks/useTeam.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:8080/api/teams';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface Team {
  id: number;
  name: string;
  description: string;
  createdById: number;
  createdByUsername: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: number;
  userId: number;
  username: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

// 내 팀 목록 조회
export const useMyTeams = () => {
  return useQuery({
    queryKey: ['my-teams'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/my`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch teams');
      return response.json() as Promise<Team[]>;
    },
  });
};

// 팀 생성
export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create team');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
    },
  });
};

// 팀 상세 조회
export const useTeam = (teamId: number) => {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/${teamId}`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch team');
      return response.json() as Promise<Team>;
    },
    enabled: !!teamId,
  });
};

// 팀 멤버 목록 조회
export const useTeamMembers = (teamId: number) => {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/${teamId}/members`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      return response.json() as Promise<TeamMember[]>;
    },
    enabled: !!teamId,
  });
};

// 팀 삭제
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: number) => {
      const response = await fetch(`${API_URL}/${teamId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || '팀 삭제에 실패했습니다.';
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
    },
  });
};

// 팀원 초대
export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, email, role }: { teamId: number; email: string; role?: string }) => {
      const response = await fetch(`${API_URL}/${teamId}/members`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ email, role: role || 'MEMBER' }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || '팀원 초대에 실패했습니다.';
        throw new Error(message);
      }
      return response.json() as Promise<TeamMember>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
    },
  });
};