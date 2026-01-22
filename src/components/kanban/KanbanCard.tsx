// src/components/kanban/KanbanCard.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Trash2, 
  MessageSquare, 
  User, 
  CheckSquare,
  Clock
} from 'lucide-react';
import { KanbanCard as CardType } from '../../hooks/useKanban';

interface KanbanCardProps {
  card: CardType;
  onDelete: (cardId: number) => void;
  onView: (card: CardType) => void;
}

const PRIORITY_COLORS = {
  LOW: 'border-l-gray-400',
  MEDIUM: 'border-l-blue-500',
  HIGH: 'border-l-orange-500',
  URGENT: 'border-l-red-500',
};

export const KanbanCard: React.FC<KanbanCardProps> = ({ 
  card, 
  onDelete,
  onView 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getDueDateColor = () => {
    if (!card.dueDate) return '';
    
    const now = new Date();
    const due = new Date(card.dueDate);
    const diff = due.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return 'text-red-600 bg-red-50';
    if (days <= 1) return 'text-orange-600 bg-orange-50';
    if (days <= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onView(card)}
      className={`bg-white rounded-lg shadow-sm border-l-4 ${
        PRIORITY_COLORS[card.priority as keyof typeof PRIORITY_COLORS]
      } border-r border-t border-b border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow`}
    >
      {/* 카드 헤더 */}
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 flex-1">{card.title}</h4>
        {/* ✅ Edit 버튼 제거, Delete만 남김 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-2"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* 카드 설명 */}
      {card.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.description}</p>
      )}

      {/* 카드 메타 정보 */}
      <div className="space-y-2">
        {/* 마감일 */}
        {card.dueDate && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${getDueDateColor()}`}>
            <Clock size={12} />
            <span>{new Date(card.dueDate).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</span>
          </div>
        )}

        {/* 체크리스트 진행률 */}
        {card.checklistTotal > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CheckSquare size={12} />
            <span>{card.checklistCompleted}/{card.checklistTotal}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  card.checklistCompleted === card.checklistTotal
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                }`}
                style={{
                  width: `${(card.checklistCompleted / card.checklistTotal) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* 하단 정보 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {/* 담당자 */}
            {card.assignedToUsername && (
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                <User size={12} />
                <span>{card.assignedToUsername}</span>
              </div>
            )}
            
            {/* 댓글 수 */}
            {card.commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={12} />
                <span>{card.commentCount}</span>
              </div>
            )}
          </div>

          {/* 작성자 */}
          <span className="text-gray-400">{card.createdByUsername}</span>
        </div>
      </div>
    </div>
  );
};