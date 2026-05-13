// src/components/layout/Sidebar.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Trello, Settings, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { path: '/', icon: Home, label: '게시판 홈', badge: null },
    { path: '/posts', icon: FileText, label: '전체 게시글', badge: null },
    { path: '/teams', icon: Users, label: '내 팀', badge: 'NEW' },
    { path: '/kanban', icon: Trello, label: '칸반 보드', badge: 'NEW' },
    { path: '/categories/manage', icon: Settings, label: '카테고리 관리', badge: null },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 오버레이 (확장 시 클릭하면 닫힘) */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200 z-40
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64' : 'w-16'}
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <nav className="p-2 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Button
                key={item.path}
                variant={active ? 'default' : 'ghost'}
                className={`w-full justify-start relative ${isExpanded ? '' : 'px-3'}`}
                onClick={() => navigate(item.path)}
                title={!isExpanded ? item.label : ''}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                
                {/* 확장 시에만 텍스트 표시 */}
                <span 
                  className={`
                    transition-all duration-300 overflow-hidden whitespace-nowrap
                    ${isExpanded ? 'ml-3 opacity-100 w-auto' : 'ml-0 opacity-0 w-0'}
                  `}
                >
                  {item.label}
                </span>

                {/* 확장 시에만 배지 표시 */}
                {item.badge && isExpanded && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto text-xs transition-all duration-300"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        {/* 확장 시에만 하단 팁 표시 */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-200 mt-4 transition-all duration-300">
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-semibold mb-2">📌 빠른 팁</p>
              <p>• 팀을 만들고 멤버를 초대하세요</p>
              <p>• 칸반 보드로 작업을 관리하세요</p>
            </div>
          </div>
        )}

        {/* 확장 인디케이터 (접힌 상태에서만 표시) */}
        {!isExpanded && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
            <div className="bg-white border border-gray-200 rounded-full p-1 shadow-sm">
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        )}
      </aside>

      {/* 메인 컨텐츠 여백 (사이드바 너비만큼) */}
      <div className={`transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-16'}`} />
    </>
  );
};