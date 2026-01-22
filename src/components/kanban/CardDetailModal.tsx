// src/components/kanban/CardDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Flag, 
  CheckSquare, 
  Square, 
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { KanbanCard } from '../../hooks/useKanban';
import { useTeamMembers } from '../../hooks/useTeam';
import {
  useUpdateCard,
  useAddChecklistItem,
  useToggleChecklistItem,
  useDeleteChecklistItem,
  useKanbanBoard,
} from '../../hooks/useKanban';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: KanbanCard;
  teamId: number;
  boardId: number;
}

const PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const PRIORITY_LABELS = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
  URGENT: '긴급',
};

// ✅ ISO 문자열을 로컬 datetime-local 형식으로 변환
const formatDateTimeLocal = (isoString: string | undefined): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    // YYYY-MM-DDTHH:mm 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('날짜 파싱 에러:', error);
    return '';
  }
};

// ✅ datetime-local 형식을 ISO 문자열로 변환
const parseLocalDateTime = (localDateTime: string): string | undefined => {
  if (!localDateTime) return undefined;
  
  try {
    // datetime-local 값을 그대로 Date 생성자에 넣으면 로컬 시간으로 해석됨
    const date = new Date(localDateTime);
    // ISO 문자열로 변환
    return date.toISOString();
  } catch (error) {
    console.error('날짜 변환 에러:', error);
    return undefined;
  }
};

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  isOpen,
  onClose,
  card: initialCard,
  teamId,
  boardId,
}) => {
  const { data: board } = useKanbanBoard(boardId);
  const card = board?.cards?.find(c => c.id === initialCard.id) || initialCard;

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [assignedTo, setAssignedTo] = useState<number | null>(card.assignedToId || null);
  const [dueDate, setDueDate] = useState(formatDateTimeLocal(card.dueDate)); // ✅ 변경
  const [priority, setPriority] = useState(card.priority);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || '');
    setAssignedTo(card.assignedToId || null);
    setDueDate(formatDateTimeLocal(card.dueDate)); // ✅ 변경
    setPriority(card.priority);
  }, [card]);

  const { data: teamMembers } = useTeamMembers(teamId);
  const updateCardMutation = useUpdateCard();
  const addChecklistMutation = useAddChecklistItem();
  const toggleChecklistMutation = useToggleChecklistItem();
  const deleteChecklistMutation = useDeleteChecklistItem();

  const handleImmediateUpdate = (updates: any) => {
    updateCardMutation.mutate({
      boardId,
      cardId: card.id,
      data: updates,
    });
  };

  const handleSave = () => {
    updateCardMutation.mutate({
      boardId,
      cardId: card.id,
      data: {
        title,
        description,
        assignedTo: assignedTo || undefined,
        dueDate: parseLocalDateTime(dueDate), // ✅ 변경
        priority,
      },
    });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;

    addChecklistMutation.mutate(
      {
        boardId,
        cardId: card.id,
        text: newChecklistItem.trim(),
      },
      {
        onSuccess: () => setNewChecklistItem(''),
      }
    );
  };

  const handleToggleChecklistItem = (e: React.MouseEvent, itemId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔄 체크리스트 토글:', itemId); // ✅ 로그
    
    toggleChecklistMutation.mutate({
      boardId,
      cardId: card.id,
      itemId,
    });
  };

const handleDeleteChecklistItem = (e: React.MouseEvent, itemId: number) => {
  e.preventDefault();
  e.stopPropagation();
  
  console.log('🗑️ 체크리스트 삭제 시도:', itemId);
  
  if (window.confirm('이 항목을 삭제하시겠습니까?')) {
    deleteChecklistMutation.mutate({
      boardId,
      cardId: card.id,
      itemId,
    });
  }
};

  const getDueDateStatus = () => {
    if (!card.dueDate) return null;
    
    const now = new Date();
    const due = new Date(card.dueDate);
    const diff = due.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return { text: '기한 초과', color: 'text-red-600' };
    if (days === 0) return { text: '오늘 마감', color: 'text-orange-600' };
    if (days === 1) return { text: '내일 마감', color: 'text-orange-600' };
    if (days <= 3) return { text: `${days}일 남음`, color: 'text-yellow-600' };
    return { text: `${days}일 남음`, color: 'text-gray-600' };
  };

  const dueDateStatus = getDueDateStatus();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="text-2xl font-semibold w-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            />
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>작성자: {card.createdByUsername}</span>
              <span>•</span>
              <span>{new Date(card.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
            <X size={24} />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 상태 정보 */}
          <div className="flex flex-wrap gap-3">
            {/* 우선순위 */}
            <div className="flex items-center gap-2">
              <Flag size={16} className="text-gray-400" />
              <select
                value={priority}
                onChange={(e) => {
                  const newPriority = e.target.value as any;
                  setPriority(newPriority);
                  handleImmediateUpdate({ priority: newPriority });
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                  PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]
                }`}
              >
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* 담당자 */}
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <select
                value={assignedTo || ''}
                onChange={(e) => {
                  const newAssignee = e.target.value ? Number(e.target.value) : null;
                  setAssignedTo(newAssignee);
                  handleImmediateUpdate({ assignedTo: newAssignee || undefined });
                }}
                className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm font-medium cursor-pointer"
              >
                <option value="">담당자 없음</option>
                {teamMembers?.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.username}
                  </option>
                ))}
              </select>
            </div>

            {/* 마감일 - ✅ 수정 */}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => {
                  const newDueDate = e.target.value;
                  setDueDate(newDueDate);
                  handleImmediateUpdate({ 
                    dueDate: parseLocalDateTime(newDueDate) // ✅ 변경
                  });
                }}
                className="px-3 py-1 bg-gray-50 text-gray-800 rounded-full text-sm cursor-pointer"
              />
              {dueDateStatus && (
                <span className={`text-sm font-medium ${dueDateStatus.color}`}>
                  <Clock size={14} className="inline mr-1" />
                  {dueDateStatus.text}
                </span>
              )}
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="카드 설명을 입력하세요..."
            />
          </div>

          {/* 체크리스트 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckSquare size={20} />
                체크리스트
                {card.checklistTotal > 0 && (
                  <span className="text-sm text-gray-500">
                    ({card.checklistCompleted}/{card.checklistTotal})
                  </span>
                )}
              </h3>
              {card.checklistTotal > 0 && (
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(card.checklistCompleted / card.checklistTotal) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* 체크리스트 아이템 목록 */}
            <div className="space-y-2 mb-3">
              {card.checklistItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded group"
                >
                  <button
                    onClick={(e) => handleToggleChecklistItem(e, item.id)}
                    className="flex-shrink-0 focus:outline-none"
                    type="button"
                  >
                    {item.completed ? (
                      <CheckSquare size={20} className="text-green-600" />
                    ) : (
                      <Square size={20} className="text-gray-400" />
                    )}
                  </button>
                  <span
                    className={`flex-1 transition-all ${
                      item.completed ? 'line-through text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={(e) => handleDeleteChecklistItem(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all focus:outline-none flex-shrink-0"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* 체크리스트 아이템 추가 */}
            <form onSubmit={handleAddChecklistItem} className="flex gap-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="새 항목 추가..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newChecklistItem.trim() || addChecklistMutation.isPending}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors flex-shrink-0"
              >
                <Plus size={16} />
                추가
              </button>
            </form>
          </div>

          {/* 댓글 섹션 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              댓글 ({card.commentCount})
            </h3>
            <div className="text-gray-500 text-sm">
              댓글 기능은 추후 추가 예정입니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};