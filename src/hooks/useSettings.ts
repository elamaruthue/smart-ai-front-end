import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setDarkModeThunk, setNotificationsThunk } from '../store/thunks';

export function useSettings() {
  const dispatch             = useAppDispatch();
  const darkMode             = useAppSelector((s) => s.settings.darkMode);
  const notificationsEnabled = useAppSelector((s) => s.settings.notificationsEnabled);

  return {
    darkMode,
    notificationsEnabled,
    setDarkMode:             (v: boolean) => { dispatch(setDarkModeThunk(v)); },
    setNotificationsEnabled: (v: boolean) => { dispatch(setNotificationsThunk(v)); },
  };
}
