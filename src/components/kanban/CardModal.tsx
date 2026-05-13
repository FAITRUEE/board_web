// src/components/kanban/CardModal.tsx
import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { KanbanCard } from '../../hooks/useKanban';
import { useTeamMembers } from '../../hooks/useTeam';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    title: string; 
    description: string; 
    status?: string;
    assignedTo?: number;
  }) => void;
  status?: string;
  editCard?: KanbanCard | null;
  teamId: number; // ✅ 추가
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  status,
  editCard,
  teamId, // ✅ 추가
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);

  // ✅ 팀 멤버 조회
  const { data: teamMembers } = useTeamMembers(teamId);

  useEffect(() => {
    if (editCard) {
      setTitle(editCard.title);
      setDescription(editCard.description);
      setAssignedTo(editCard.assignedToId || null);
    } else {
      setTitle('');
      setDescription('');
      setAssignedTo(null);
    }
  }, [editCard, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      ...(status && !editCard ? { status } : {}),
      ...(assignedTo ? { assignedTo } : {}),
    });

    setTitle('');
    setDescription('');
    setAssignedTo(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editCard ? '카드 수정' : '새 카드 추가'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 제목 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="카드 제목을 입력하세요"
              autoFocus
            />
          </div>

          {/* 설명 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="카드 설명을 입력하세요"
            />
          </div>

          {/* ✅ 담당자 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              담당자
            </label>
            <select
              value={assignedTo || ''}
              onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">담당자 없음</option>
              {teamMembers?.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.username} ({member.role})
                </option>
              ))}
            </select>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {editCard ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};