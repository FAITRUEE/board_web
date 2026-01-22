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
} from '../hooks/useKanban';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { KanbanCard } from '../components/kanban/KanbanCard';
import { CardModal } from '../components/kanban/CardModal';

const COLUMNS = [
  { id: 'TODO', title: '할 일 (To Do)' },
  { id: 'IN_PROGRESS', title: '진행 중 (In Progress)' },
  { id: 'DONE', title: '완료 (Done)' },
];

export const KanbanBoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<string>('');
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  // React Query hooks
  const { data: board, isLoading } = useKanbanBoard(Number(boardId));
  const moveCardMutation = useMoveCard();
  const createCardMutation = useCreateCard();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();

  // 드래그 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 상태별 카드 분류
  const cardsByStatus = {
    TODO: board?.cards?.filter((c) => c.status === 'TODO').sort((a, b) => a.position - b.position) || [],
    IN_PROGRESS: board?.cards?.filter((c) => c.status === 'IN_PROGRESS').sort((a, b) => a.position - b.position) || [],
    DONE: board?.cards?.filter((c) => c.status === 'DONE').sort((a, b) => a.position - b.position) || [],
  };

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    const card = board?.cards?.find((c) => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  // 드래그 종료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveCard(null);

    if (!over) return;

    const cardId = active.id as number;
    const overId = over.id;

    // 컬럼에 드롭한 경우
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
    // 다른 카드 위에 드롭한 경우
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

  // 카드 추가
  const handleAddCard = (status: string) => {
    setModalStatus(status);
    setEditingCard(null);
    setIsModalOpen(true);
  };

  // 카드 수정
  const handleEditCard = (card: CardType) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  // 카드 삭제
  const handleDeleteCard = (cardId: number) => {
    if (window.confirm('이 카드를 삭제하시겠습니까?')) {
      deleteCardMutation.mutate({ boardId: Number(boardId), cardId });
    }
  };

  // 모달 제출
  const handleModalSubmit = (data: { title: string; description: string; status?: string }) => {
    if (editingCard) {
      // 카드 수정
      updateCardMutation.mutate({
        boardId: Number(boardId),
        cardId: editingCard.id,
        data: {
          title: data.title,
          description: data.description,
        },
      });
    } else {
      // 카드 생성
      createCardMutation.mutate({
        boardId: Number(boardId),
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
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
                onEditCard={handleEditCard}
              />
            ))}
          </div>

          {/* 드래그 오버레이 */}
          <DragOverlay>
            {activeCard ? (
              <div className="rotate-3 scale-105">
                <KanbanCard
                  card={activeCard}
                  onDelete={() => {}}
                  onEdit={() => {}}
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
      />
    </div>
  );
};