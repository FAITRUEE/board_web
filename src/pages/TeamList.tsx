// src/pages/TeamList.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar } from 'lucide-react';
import { useMyTeams, useCreateTeam } from '../hooks/useTeam';

export const TeamListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: teams, isLoading } = useMyTeams();
  const createTeamMutation = useCreateTeam();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

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

                <button
                  onClick={() => navigate(`/kanban?teamId=${team.id}`)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  칸반 보드 보기
                </button>
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
    </div>
  );
};