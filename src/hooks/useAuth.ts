import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutAction, clearAuthError } from '../store/slices/authSlice';
import { clearProgress } from '../store/slices/progressSlice';
import { clearToken } from '../api/auth';

export function useAuth() {
  const dispatch = useAppDispatch();
  const user     = useAppSelector((s) => s.auth.user);
  const loading  = useAppSelector((s) => s.auth.loading);
  const error    = useAppSelector((s) => s.auth.error);

  const logout = () => {
    dispatch(logoutAction());
    dispatch(clearProgress());
    clearToken();
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
    clearError: () => dispatch(clearAuthError()),
  };
}
