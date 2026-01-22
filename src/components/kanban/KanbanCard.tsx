import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Edit2, MessageSquare, User } from 'lucide-react';
import { KanbanCard as CardType } from '../../hooks/useKanban';

interface KanbanCardProps {
  card: CardType;
  onDelete: (cardId: number) => void;
  onEdit: (card: CardType) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, onDelete, onEdit }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      {/* 카드 헤더 */}
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 flex-1">{card.title}</h4>
        <div className="flex gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* 카드 설명 */}
      {card.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.description}</p>
      )}

      {/* 카드 하단 정보 */}
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
  );
};