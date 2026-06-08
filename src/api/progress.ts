import api from './client';
import type { DayProgress, QuizResult, MockTestResult } from '../store/slices/progressSlice';

export interface ProgressResponse {
  progress: Record<string, DayProgress>;
  quizResults: Record<string, QuizResult>;
  mockTestResult: MockTestResult | null;
  settings: {
    selected_path?: string | null;
    selected_skill?: string | null;
    current_day?: number;
    dark_mode?: number;
    notifications?: number;
  };
}

export async function fetchProgress(): Promise<ProgressResponse> {
  const { data } = await api.get<ProgressResponse>('/progress');
  return data;
}

export async function syncDayComplete(skill: string, day: number): Promise<void> {
  await api.post('/progress/day', { skill, day });
}

export async function syncSettings(payload: {
  selectedPath?: string;
  selectedSkill?: string;
  currentDay?: number;
  darkMode?: boolean;
  notificationsEnabled?: boolean;
}): Promise<void> {
  await api.post('/progress/settings', payload);
}
