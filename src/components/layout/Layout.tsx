// src/components/layout/Layout.tsx
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // 사이드바를 숨길 페이지들
  const hideSidebarPaths = ['/posts/create', '/posts/:id/edit'];
  const shouldShowSidebar = !hideSidebarPaths.some(path => 
    location.pathname.includes('create') || location.pathname.includes('edit')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="relative">
        {shouldShowSidebar && <Sidebar />}
        <main className={shouldShowSidebar ? '' : 'ml-0'}>
          {children}
        </main>
      </div>
    </div>
  );
};