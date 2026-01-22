// src/pages/KanbanBoard.tsx
import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useKanbanBoard,
  useMoveCard,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
  KanbanCard as CardType,
  UpdateCardData, // ✅ 타입 import 추가
} from '../hooks/useKanban';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { KanbanCard } from '../components/kanban/KanbanCard';
import { CardModal } from '../components/kanban/CardModal';
import { CardDetailModal } from '../components/kanban/CardDetailModal';

const COLUMNS = [
  { id: 'TODO', title: '할 일 (To Do)' },
  { id: 'IN_PROGRESS', title: '진행 중 (In Progress)' },
  { id: 'DONE', title: '완료 (Done)' },
];

// ✅ 카드 폼 데이터 타입 정의
interface CardFormData {
  title: string;
  description: string;
  status?: string;
  assignedTo?: number;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; // ✅ 명시적 타입
}

export const KanbanBoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<string>('');
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [viewingCard, setViewingCard] = useState<CardType | null>(null);

  const { data: board, isLoading } = useKanbanBoard(Number(boardId));
  const moveCardMutation = useMoveCard();
  const createCardMutation = useCreateCard();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const cardsByStatus = {
    TODO: board?.cards?.filter((c) => c.status === 'TODO').sort((a, b) => a.position - b.position) || [],
    IN_PROGRESS: board?.cards?.filter((c) => c.status === 'IN_PROGRESS').sort((a, b) => a.position - b.position) || [],
    DONE: board?.cards?.filter((c) => c.status === 'DONE').sort((a, b) => a.position - b.position) || [],
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = board?.cards?.find((c) => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveCard(null);

    if (!over) return;

    const cardId = active.id as number;
    const overId = over.id;

    if (typeof overId === 'string' && ['TODO', 'IN_PROGRESS', 'DONE'].includes(overId)) {
      const newStatus = overId;
      const cardsInColumn = cardsByStatus[newStatus as keyof typeof cardsByStatus];
      
      moveCardMutation.mutate({
        boardId: Number(boardId),
        cardId,
        status: newStatus,
        position: cardsInColumn.length,
      });
    }
    else if (typeof overId === 'number') {
      const targetCard = board?.cards?.find((c) => c.id === overId);
      if (targetCard) {
        moveCardMutation.mutate({
          boardId: Number(boardId),
          cardId,
          status: targetCard.status,
          position: targetCard.position,
        });
      }
    }
  };

  const handleAddCard = (status: string) => {
    setModalStatus(status);
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleEditCard = (card: CardType) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleViewCard = (card: CardType) => {
    setViewingCard(card);
  };

  const handleDeleteCard = (cardId: number) => {
    if (window.confirm('이 카드를 삭제하시겠습니까?')) {
      deleteCardMutation.mutate({ boardId: Number(boardId), cardId });
    }
  };

  // ✅ 타입 지정
  const handleModalSubmit = (data: CardFormData) => {
    if (editingCard) {
      // ✅ UpdateCardData 타입에 맞게 변환
      const updateData: UpdateCardData = {
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate,
        priority: data.priority, // ✅ 이미 올바른 타입
      };

      updateCardMutation.mutate({
        boardId: Number(boardId),
        cardId: editingCard.id,
        data: updateData,
      });
    } else {
      createCardMutation.mutate({
        boardId: Number(boardId),
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
          assignedTo: data.assignedTo,
          dueDate: data.dueDate,
          priority: data.priority,
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">보드를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/kanban')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
              {board.description && (
                <p className="text-sm text-gray-600 mt-1">{board.description}</p>
              )}
            </div>
            <div className="ml-auto text-sm text-gray-500">
              팀: {board.teamName}
            </div>
          </div>
        </div>
      </div>

      {/* 칸반 보드 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                cards={cardsByStatus[column.id as keyof typeof cardsByStatus]}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
                onViewCard={handleViewCard}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="rotate-3 scale-105">
                <KanbanCard
                  card={activeCard}
                  onDelete={() => {}}
                  onView={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 카드 추가/수정 모달 */}
      <CardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        onSubmit={handleModalSubmit}
        status={modalStatus}
        editCard={editingCard}
        teamId={board.teamId}
      />

      {/* 카드 상세 모달 */}
      {viewingCard && (
        <CardDetailModal
          isOpen={!!viewingCard}
          onClose={() => setViewingCard(null)}
          card={viewingCard}
          teamId={board.teamId}
          boardId={Number(boardId)}
        />
      )}
    </div>
  );
};