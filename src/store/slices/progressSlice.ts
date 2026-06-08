import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DayProgress {
  completedDays: number[];
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
}

export interface MockTestResult {
  score: number;
  total: number;
  accuracy: number;
  weakAreas: string[];
  timeTaken: number;
}

interface ProgressState {
  selectedPath: string | null;
  selectedSkill: string | null;
  progress: Record<string, DayProgress>;
  quizResults: Record<string, QuizResult>;
  mockTestResult: MockTestResult | null;
  currentDay: number;
}

const load = <T>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

const initialState: ProgressState = {
  selectedPath: localStorage.getItem('smartprep_path'),
  selectedSkill: localStorage.getItem('smartprep_skill'),
  progress: load<Record<string, DayProgress>>('smartprep_progress', {}),
  quizResults: load<Record<string, QuizResult>>('smartprep_quiz_results', {}),
  mockTestResult: load<MockTestResult | null>('smartprep_mock_result', null),
  currentDay: parseInt(localStorage.getItem('smartprep_current_day') ?? '1', 10),
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setSelectedPath(state, action: PayloadAction<string>) {
      state.selectedPath = action.payload;
      localStorage.setItem('smartprep_path', action.payload);
    },
    setSelectedSkill(state, action: PayloadAction<string>) {
      state.selectedSkill = action.payload;
      localStorage.setItem('smartprep_skill', action.payload);
    },
    setCurrentDay(state, action: PayloadAction<number>) {
      state.currentDay = action.payload;
      localStorage.setItem('smartprep_current_day', String(action.payload));
    },
    markDayComplete(state, action: PayloadAction<{ skill: string; day: number }>) {
      const { skill, day } = action.payload;
      const existing = state.progress[skill]?.completedDays ?? [];
      if (!existing.includes(day)) {
        state.progress[skill] = { completedDays: [...existing, day] };
        localStorage.setItem('smartprep_progress', JSON.stringify(state.progress));
      }
    },
    saveQuizResult(
      state,
      action: PayloadAction<{ skill: string; day: number; score: number; total: number }>
    ) {
      const { skill, day, score, total } = action.payload;
      const key = `${skill}_day${day}`;
      state.quizResults[key] = {
        score,
        total,
        passed: score >= Math.ceil(total * 0.6),
      };
      localStorage.setItem('smartprep_quiz_results', JSON.stringify(state.quizResults));
    },
    setMockTestResult(state, action: PayloadAction<MockTestResult>) {
      state.mockTestResult = action.payload;
      localStorage.setItem('smartprep_mock_result', JSON.stringify(action.payload));
    },
    clearProgress(state) {
      state.selectedPath = null;
      state.selectedSkill = null;
      state.progress = {};
      state.quizResults = {};
      state.mockTestResult = null;
      state.currentDay = 1;
    },
    /** Bulk-load all progress data fetched from the backend */
    hydrateProgress(
      state,
      action: PayloadAction<{
        progress: Record<string, DayProgress>;
        quizResults: Record<string, QuizResult>;
        mockTestResult: MockTestResult | null;
        selectedPath?: string | null;
        selectedSkill?: string | null;
        currentDay?: number;
      }>
    ) {
      const { progress, quizResults, mockTestResult, selectedPath, selectedSkill, currentDay } = action.payload;

      // Merge completedDays: take the UNION of local + remote so offline
      // completions are never lost when the backend hasn't received them yet.
      const mergedProgress: Record<string, DayProgress> = { ...progress };
      for (const [skill, localData] of Object.entries(state.progress)) {
        const remote = progress[skill];
        if (!remote) {
          mergedProgress[skill] = localData;
        } else {
          const merged = Array.from(
            new Set([...localData.completedDays, ...remote.completedDays])
          ).sort((a, b) => a - b);
          mergedProgress[skill] = { completedDays: merged };
        }
      }
      state.progress = mergedProgress;

      // Merge quiz results (keep the best/latest per key)
      state.quizResults = { ...state.quizResults, ...quizResults };

      if (mockTestResult) state.mockTestResult = mockTestResult;
      // Only update path/skill/day from backend if it returns a non-null value
      // (prevents backend null from wiping locally-stored selections)
      if (selectedPath) state.selectedPath = selectedPath;
      if (selectedSkill) state.selectedSkill = selectedSkill;
      if (currentDay && currentDay > 0) state.currentDay = currentDay;
      // Sync to localStorage so offline works too
      localStorage.setItem('smartprep_progress', JSON.stringify(mergedProgress));
      localStorage.setItem('smartprep_quiz_results', JSON.stringify(state.quizResults));
      if (mockTestResult) localStorage.setItem('smartprep_mock_result', JSON.stringify(mockTestResult));
      if (selectedPath) localStorage.setItem('smartprep_path', selectedPath);
      if (selectedSkill) localStorage.setItem('smartprep_skill', selectedSkill);
      if (currentDay) localStorage.setItem('smartprep_current_day', String(currentDay));
    },
  },
});

export const {
  setSelectedPath,
  setSelectedSkill,
  setCurrentDay,
  markDayComplete,
  saveQuizResult,
  setMockTestResult,
  clearProgress,
  hydrateProgress,
} = progressSlice.actions;
export default progressSlice.reducer;
