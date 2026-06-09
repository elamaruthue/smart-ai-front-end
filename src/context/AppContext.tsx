/**
 * AppContext – thin adapter over Redux store.
 * All mutation actions fire-and-forget API calls to sync with MySQL backend.
 * Pages/components keep using `useApp()` unchanged.
 */
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginAction, logoutAction } from '../store/slices/authSlice';
import type { User } from '../store/slices/authSlice';
import {
  setSelectedPath as setPathAction,
  setSelectedSkill as setSkillAction,
  setCurrentDay as setCurrentDayAction,
  markDayComplete as markDayCompleteAction,
  saveQuizResult as saveQuizResultAction,
  setMockTestResult as setMockTestResultAction,
  clearProgress,
  hydrateProgress,
} from '../store/slices/progressSlice';
import type { DayProgress, QuizResult, MockTestResult } from '../store/slices/progressSlice';
import {
  setDarkMode as setDarkModeAction,
  setNotificationsEnabled as setNotifAction,
  hydrateSettings,
} from '../store/slices/settingsSlice';
import { getMeApi, clearToken } from '../api/auth';
import { fetchProgress, syncDayComplete, syncSettings } from '../api/progress';
import { submitQuizResult, submitMockResult } from '../api/quiz';
import { fetchCourseData } from '../store/slices/courseDataSlice';

// ─── Re-export types so existing imports keep working ─────────────────────────
export type { User } from '../store/slices/authSlice';
export type { DayProgress, QuizResult, MockTestResult } from '../store/slices/progressSlice';

// ─── Context value type ───────────────────────────────────────────────────────
interface AppContextValue {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  selectedPath: string | null;
  setSelectedPath: (path: string) => void;
  selectedSkill: string | null;
  setSelectedSkill: (skill: string) => void;
  progress: Record<string, DayProgress>;
  quizResults: Record<string, QuizResult>;
  mockTestResult: MockTestResult | null;
  setMockTestResult: (result: MockTestResult) => void;
  currentDay: number;
  setCurrentDay: (day: number) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  markDayComplete: (skill: string, day: number) => void;
  saveQuizResult: (skill: string, day: number, score: number, total: number) => void;
  getCompletedDays: (skill: string) => number[];
  getUnlockedDay: (skill: string) => number;
  getDayStreak: () => number;
  getAvgScore: () => number;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext<AppContextValue | null>(null);

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();

  // ── Selectors ──────────────────────────────────────────────────────────────
  const user = useAppSelector((s) => s.auth.user);
  const selectedPath = useAppSelector((s) => s.progress.selectedPath);
  const selectedSkill = useAppSelector((s) => s.progress.selectedSkill);
  const progress = useAppSelector((s) => s.progress.progress);
  const quizResults = useAppSelector((s) => s.progress.quizResults);
  const mockTestResult = useAppSelector((s) => s.progress.mockTestResult);
  const currentDay = useAppSelector((s) => s.progress.currentDay);
  const darkMode = useAppSelector((s) => s.settings.darkMode);
  const notificationsEnabled = useAppSelector((s) => s.settings.notificationsEnabled);

  // ── Restore session from token on app load ─────────────────────────────────
  useEffect(() => {
    // Always fetch course data (public endpoint, no auth required)
    // dispatch(fetchCourseData());

    const token = localStorage.getItem('smartprep_token');
    if (token && !user) {
      getMeApi()
        .then((me) => {
          dispatch(loginAction({ username: me.username, email: me.email, role: me.role }));
          return fetchProgress();
        })
        .then((data) => {
          dispatch(hydrateProgress({
            progress:       data.progress       ?? {},
            quizResults:    data.quizResults    ?? {},
            mockTestResult: data.mockTestResult ?? null,
            selectedPath:   data.settings?.selected_path  ?? null,
            selectedSkill:  data.settings?.selected_skill ?? null,
            currentDay:     data.settings?.current_day    ?? 1,
          }));
          dispatch(hydrateSettings({
            darkMode:             !!data.settings?.dark_mode,
            notificationsEnabled: data.settings?.notifications !== 0,
          }));
        })
        .catch((err) => {
          // Only clear token if it's an auth error (401), not a network / DB error
          if (err?.response?.status === 401) clearToken();
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const login = (userData: User) => {
    dispatch(loginAction(userData));
    fetchProgress()
      .then((data) => {
        dispatch(hydrateProgress({
          progress:       data.progress       ?? {},
          quizResults:    data.quizResults    ?? {},
          mockTestResult: data.mockTestResult ?? null,
          selectedPath:   data.settings?.selected_path  ?? null,
          selectedSkill:  data.settings?.selected_skill ?? null,
          currentDay:     data.settings?.current_day    ?? 1,
        }));
        dispatch(hydrateSettings({
          darkMode:             !!data.settings?.dark_mode,
          notificationsEnabled: data.settings?.notifications !== 0,
        }));
      })
      .catch(console.warn);
  };

  const logout = () => {
    dispatch(logoutAction());
    dispatch(clearProgress());
    clearToken();
  };

  // ── Path / Skill / Day ─────────────────────────────────────────────────────
  const setSelectedPath = (path: string) => {
    dispatch(setPathAction(path));
    syncSettings({ selectedPath: path }).catch(console.warn);
  };

  const setSelectedSkill = (skill: string) => {
    dispatch(setSkillAction(skill));
    syncSettings({ selectedSkill: skill }).catch(console.warn);
  };

  const setCurrentDay = (day: number) => {
    dispatch(setCurrentDayAction(day));
    syncSettings({ currentDay: day }).catch(console.warn);
  };

  // ── Progress ───────────────────────────────────────────────────────────────
  const markDayComplete = (skill: string, day: number) => {
    dispatch(markDayCompleteAction({ skill, day }));
    syncDayComplete(skill, day).catch(console.warn);
  };

  const saveQuizResult = (skill: string, day: number, score: number, total: number) => {
    dispatch(saveQuizResultAction({ skill, day, score, total }));
    submitQuizResult(skill, day, score, total).catch(console.warn);
  };

  const setMockTestResult = (result: MockTestResult) => {
    dispatch(setMockTestResultAction(result));
    submitMockResult({
      score: result.score,
      total: result.total,
      accuracy: result.accuracy,
      timeTaken: result.timeTaken,
      weakAreas: result.weakAreas,
    }).catch(console.warn);
  };

  // ── Settings ───────────────────────────────────────────────────────────────
  const setDarkMode = (v: boolean) => {
    dispatch(setDarkModeAction(v));
    syncSettings({ darkMode: v }).catch(console.warn);
  };

  const setNotificationsEnabled = (v: boolean) => {
    dispatch(setNotifAction(v));
    syncSettings({ notificationsEnabled: v }).catch(console.warn);
  };

  // ── Derived selectors ──────────────────────────────────────────────────────
  const getCompletedDays = (skill: string): number[] =>
    progress[skill]?.completedDays ?? [];

  const getUnlockedDay = (skill: string): number =>
    (progress[skill]?.completedDays.length ?? 0) + 1;

  const getDayStreak = (): number =>
    Object.values(progress).reduce((sum, p) => sum + (p.completedDays?.length ?? 0), 0);

  const getAvgScore = (): number => {
    const results = Object.values(quizResults);
    if (!results.length) return 0;
    const avg =
      results.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / results.length;
    return Math.round(avg);
  };

  return (
    <AppContext.Provider
      value={{
        user, login, logout,
        selectedPath, setSelectedPath,
        selectedSkill, setSelectedSkill,
        progress, quizResults, mockTestResult, setMockTestResult,
        currentDay, setCurrentDay,
        darkMode, setDarkMode,
        notificationsEnabled, setNotificationsEnabled,
        markDayComplete, saveQuizResult,
        getCompletedDays, getUnlockedDay, getDayStreak, getAvgScore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
