import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, SignupRequest } from '@/types/auth';
import * as authService from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  signup: (request: SignupRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // 초기 로드 시 로컬스토리지에서 토큰 확인
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (request: LoginRequest) => {
    try {
      const response = await authService.login(request);
      authService.setToken(response.token);
      setUser(response.user);
      
      toast({
        title: '로그인 성공',
        description: `환영합니다, ${response.user.username}님!`,
      });
    } catch (error: any) {
      toast({
        title: '로그인 실패',
        description: error.message || '이메일 또는 비밀번호가 올바르지 않습니다.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signup = async (request: SignupRequest) => {
    try {
      const response = await authService.signup(request);
      authService.setToken(response.token);
      setUser(response.user);
      
      toast({
        title: '회원가입 성공',
        description: `환영합니다, ${response.user.username}님!`,
      });
    } catch (error: any) {
      toast({
        title: '회원가입 실패',
        description: error.message || '회원가입 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
    
    toast({
      title: '로그아웃',
      description: '안전하게 로그아웃되었습니다.',
    });
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};