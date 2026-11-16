import { Role, UserResponseDto } from './api';

export interface AuthSession {
  user: UserResponseDto | null;
  roles: Role[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionRestoring: boolean;
}

export interface AuthState extends AuthSession {
  // In-memory token management
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: UserResponseDto) => void;
  setSessionRestoring: (status: boolean) => void;
  logout: () => Promise<void>;
  hasRole: (role: Role | Role[]) => boolean;
  canAccessStorefront: () => boolean;
  clearAuth: () => void;
}
