// src/pages/TeamList.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar, Trash2, UserPlus, Eye } from 'lucide-react';
import { useMyTeams, useCreateTeam, useDeleteTeam, useInviteMember, useTeamMembers, Team } from '../hooks/useTeam';

export const TeamListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: teams, isLoading } = useMyTeams();
  const createTeamMutation = useCreateTeam();
  const deleteTeamMutation = useDeleteTeam();
  const inviteMemberMutation = useInviteMember();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [viewingTeamId, setViewingTeamId] = useState<number | null>(null);

  const { data: teamMembers, isLoading: isMembersLoading } = useTeamMembers(viewingTeamId || 0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'MEMBER' as 'MEMBER' | 'ADMIN',
  });

  const handleDeleteTeam = (teamId: number, teamName: string) => {
    if (window.confirm(`"${teamName}" 팀을 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  const handleOpenInviteModal = (team: Team) => {
    setSelectedTeam(team);
    setInviteData({ email: '', role: 'MEMBER' });
    setIsInviteModalOpen(true);
  };

  const handleOpenMembersModal = (team: Team) => {
    setSelectedTeam(team);
    setViewingTeamId(team.id);
    setIsMembersModalOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER': return '소유자';
      case 'ADMIN': return '관리자';
      default: return '멤버';
    }
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteData.email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    if (!selectedTeam) return;

    inviteMemberMutation.mutate(
      {
        teamId: selectedTeam.id,
        email: inviteData.email.trim(),
        role: inviteData.role,
      },
      {
        onSuccess: () => {
          setIsInviteModalOpen(false);
          setInviteData({ email: '', role: 'MEMBER' });
          alert('팀원이 초대되었습니다!');
        },
        onError: (error) => {
          alert(error.message || '초대에 실패했습니다.');
        },
      }
    );
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    
    createTeamMutation.mutate(
      {
        name: formData.name,
        description: formData.description,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setFormData({ name: '', description: '' });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">내 팀</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} />
              새 팀 만들기
            </button>
          </div>
        </div>
      </div>

      {/* 팀 목록 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!teams || teams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">아직 생성된 팀이 없습니다.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              첫 팀을 만들어보세요 →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {team.name}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    ID: {team.id}
                  </span>
                </div>
                
                {team.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {team.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{team.memberCount} 멤버</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/kanban?teamId=${team.id}`)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    칸반 보드
                  </button>
                  <button
                    onClick={() => handleOpenMembersModal(team)}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    title="팀원 보기"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleOpenInviteModal(team)}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    title="팀원 초대"
                  >
                    <UserPlus size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="팀 삭제"
                    disabled={deleteTeamMutation.isPending}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 팀 생성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">새 팀 만들기</h2>
            
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 개발팀"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="팀 설명을 입력하세요"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 팀원 초대 모달 */}
      {isInviteModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-2">팀원 초대</h2>
            <p className="text-gray-600 text-sm mb-4">
              "{selectedTeam.name}" 팀에 새 멤버를 초대합니다
            </p>

            <form onSubmit={handleInviteMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="초대할 사용자의 이메일을 입력하세요"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  역할
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as 'MEMBER' | 'ADMIN' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="MEMBER">멤버</option>
                  <option value="ADMIN">관리자</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={inviteMemberMutation.isPending}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {inviteMemberMutation.isPending ? '초대 중...' : '초대'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 팀원 목록 모달 */}
      {isMembersModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">팀원 목록</h2>
              <span className="text-sm text-gray-500">{selectedTeam.name}</span>
            </div>

            {isMembersLoading ? (
              <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : teamMembers && teamMembers.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{member.username}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getRoleBadgeColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">팀원이 없습니다.</div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsMembersModalOpen(false);
                  setViewingTeamId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setIsMembersModalOpen(false);
                  handleOpenInviteModal(selectedTeam);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                팀원 초대
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};