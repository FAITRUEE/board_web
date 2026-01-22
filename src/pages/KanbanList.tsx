// src/pages/KanbanList.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar, ArrowLeft } from 'lucide-react';
import { useMyBoards, useCreateBoard } from '../hooks/useKanban';
import { useMyTeams } from '../hooks/useTeam';  // ✅ 추가

export const KanbanListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: boards, isLoading } = useMyBoards();
  const { data: teams } = useMyTeams();  // ✅ 추가
  const createBoardMutation = useCreateBoard();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    teamId: '',
    name: '',
    description: '',
  });

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    
    createBoardMutation.mutate(
      {
        teamId: Number(formData.teamId),
        name: formData.name,
        description: formData.description,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setFormData({ teamId: '', name: '', description: '' });
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/teams')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">칸반 보드</h1>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} />
              새 보드 만들기
            </button>
          </div>
        </div>
      </div>

      {/* 보드 목록 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!boards || boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">아직 생성된 칸반 보드가 없습니다.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              첫 보드를 만들어보세요 →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => navigate(`/kanban/${board.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {board.name}
                </h3>
                {board.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {board.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{board.teamName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{board.cardCount} 카드</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 보드 생성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">새 칸반 보드 만들기</h2>
            
            <form onSubmit={handleCreateBoard}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀 선택 *
                </label>
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">팀을 선택하세요</option>
                  {teams?.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} (ID: {team.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보드 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: Sprint 1"
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
                  placeholder="보드 설명을 입력하세요"
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