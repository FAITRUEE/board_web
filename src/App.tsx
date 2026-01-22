// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { Layout } from './components/layout/Layout';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import PostCreatePage from './pages/PostCreatePage';
import PostEditPage from './pages/PostEditPage';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import CategoryManagePage from "@/pages/CategoryManagePage";
import { KanbanListPage } from './pages/KanbanList';
import { KanbanBoardPage } from './pages/KanbanBoard';
import { TeamListPage } from './pages/TeamList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 인증 필요한 라우트 보호
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 인증 페이지 (헤더 없음) */}
            <Route path="/auth" element={<Auth />} />
            
            {/* 레이아웃 적용 페이지 (헤더 있음) */}
            <Route path="/" element={<Layout><PostListPage /></Layout>} />
            <Route path="/posts" element={<Layout><PostListPage /></Layout>} />
            <Route path="/posts/:id" element={<Layout><PostDetailPage /></Layout>} />
            <Route 
              path="/posts/create" 
              element={
                <Layout>
                  <ProtectedRoute>
                    <PostCreatePage />
                  </ProtectedRoute>
                </Layout>
              } 
            />
            <Route 
              path="/posts/:id/edit" 
              element={
                <Layout>
                  <ProtectedRoute>
                    <PostEditPage />
                  </ProtectedRoute>
                </Layout>
              } 
            />
            <Route 
              path="/categories/manage" 
              element={
                <Layout>
                  <CategoryManagePage />
                </Layout>
              } 
            />
            <Route 
              path="/teams" 
              element={
                <Layout>
                  <TeamListPage />
                </Layout>
              } 
            />
            <Route 
              path="/kanban" 
              element={
                <Layout>
                  <KanbanListPage />
                </Layout>
              } 
            />
            <Route 
              path="/kanban/:boardId" 
              element={
                <Layout>
                  <KanbanBoardPage />
                </Layout>
              } 
            />
            
            {/* 404 페이지 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;