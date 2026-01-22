// src/components/layout/Header.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, PlusCircle, Settings, Users, Kanban as KanbanIcon, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 로고 + 네비게이션 */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="logo" className="w-9 h-9" />
              <h1 className="text-2xl font-bold text-gray-900">SmartBoard</h1>
              <Badge variant="secondary">CRUD Board</Badge>
            </div>

            {/* 네비게이션 메뉴 */}
            <nav className="flex items-center space-x-2">
              <Button
                variant={isActive('/posts') || location.pathname === '/' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>게시판</span>
              </Button>

              <Button
                variant={isActive('/teams') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/teams')}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>내 팀</span>
              </Button>

              <Button
                variant={isActive('/kanban') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/kanban')}
                className="flex items-center gap-2"
              >
                <KanbanIcon className="w-4 h-4" />
                <span>칸반 보드</span>
              </Button>
            </nav>
          </div>

          {/* 오른쪽: 사용자 메뉴 */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  환영합니다, {user.username}님
                </span>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/categories/manage")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  카테고리 관리
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate("/posts/create")}
                  className="flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>글쓰기</span>
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/auth")}
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};