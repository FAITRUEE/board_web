// src/components/kanban/KanbanColumn.tsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { KanbanCard as CardType } from '../../hooks/useKanban';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  cards: CardType[];
  onAddCard: (status: string) => void;
  onDeleteCard: (cardId: number) => void;
  onEditCard: (card: CardType) => void;
}

const COLUMN_COLORS = {
  TODO: 'bg-gray-50 border-gray-300',
  IN_PROGRESS: 'bg-blue-50 border-blue-300',
  DONE: 'bg-green-50 border-green-300',
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  cards,
  onAddCard,
  onDeleteCard,
  onEditCard,
}) => {
  const { setNodeRef } = useDroppable({ id });

  const colorClass = COLUMN_COLORS[id as keyof typeof COLUMN_COLORS] || 'bg-gray-50';

  return (
    <div className={`flex-1 min-w-[300px] rounded-lg border-2 ${colorClass} p-4`}>
      {/* 컬럼 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          {title}
          <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full">
            {cards.length}
          </span>
        </h3>
        <button
          onClick={() => onAddCard(id)}
          className="p-1 hover:bg-white rounded transition-colors"
        >
          <Plus size={20} className="text-gray-600" />
        </button>
      </div>

      {/* 카드 드롭 영역 */}
      <div ref={setNodeRef} className="min-h-[500px]">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onDelete={onDeleteCard}
              onEdit={onEditCard}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};