import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchProgressThunk,
  syncDayCompleteThunk,
  saveQuizResultThunk,
  saveMockResultThunk,
  setSelectedPathThunk,
  setSelectedSkillThunk,
  setCurrentDayThunk,
} from '../store/thunks';
import type { MockTestResult } from '../store/slices/progressSlice';

export function useProgress() {
  const dispatch       = useAppDispatch();
  const selectedPath   = useAppSelector((s) => s.progress.selectedPath);
  const selectedSkill  = useAppSelector((s) => s.progress.selectedSkill);
  const progress       = useAppSelector((s) => s.progress.progress);
  const quizResults    = useAppSelector((s) => s.progress.quizResults);
  const mockTestResult = useAppSelector((s) => s.progress.mockTestResult);
  const currentDay     = useAppSelector((s) => s.progress.currentDay);

  // ── Derived ────────────────────────────────────────────────────────────────
  const getCompletedDays = (skill: string) =>
    progress[skill]?.completedDays ?? [];

  const getUnlockedDay = (skill: string) =>
    (progress[skill]?.completedDays.length ?? 0) + 1;

  const getDayStreak = () =>
    Object.values(progress).reduce((sum, p) => sum + (p.completedDays?.length ?? 0), 0);

  const getAvgScore = () => {
    const results = Object.values(quizResults);
    if (!results.length) return 0;
    const avg = results.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / results.length;
    return Math.round(avg);
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  return {
    selectedPath,
    selectedSkill,
    progress,
    quizResults,
    mockTestResult,
    currentDay,
    getCompletedDays,
    getUnlockedDay,
    getDayStreak,
    getAvgScore,
    setSelectedPath:  (path: string)  => { dispatch(setSelectedPathThunk(path)); },
    setSelectedSkill: (skill: string) => { dispatch(setSelectedSkillThunk(skill)); },
    setCurrentDay:    (day: number)   => { dispatch(setCurrentDayThunk(day)); },
    fetchProgress:    ()              => { dispatch(fetchProgressThunk()); },
    syncDayComplete:  (skill: string, day: number) => { dispatch(syncDayCompleteThunk({ skill, day })); },
    saveQuizResult:   (skill: string, day: number, score: number, total: number) => {
      dispatch(saveQuizResultThunk({ skill, day, score, total }));
    },
    saveMockResult: (result: MockTestResult) => { dispatch(saveMockResultThunk(result)); },
  };
}
