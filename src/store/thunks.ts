/**
 * Compound async thunks that either span multiple slices or
 * combine a local Redux dispatch with a background API sync.
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProgress, syncDayComplete, syncSettings } from '../api/progress';
import { submitQuizResult, submitMockResult }            from '../api/quiz';
import {
  hydrateProgress,
  markDayComplete,
  saveQuizResult,
  setMockTestResult,
  setSelectedPath  as setPathAction,
  setSelectedSkill as setSkillAction,
  setCurrentDay    as setCurrentDayAction,
} from './slices/progressSlice';
import {
  hydrateSettings,
  setDarkMode             as setDarkModeAction,
  setNotificationsEnabled as setNotifAction,
} from './slices/settingsSlice';
import type { MockTestResult } from './slices/progressSlice';

// ─── Progress fetch ────────────────────────────────────────────────────────────

export const fetchProgressThunk = createAsyncThunk(
  'app/fetchProgress',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await fetchProgress();
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
      return data;
    } catch {
      return rejectWithValue('Failed to load progress');
    }
  },
);

// ─── Progress sync ─────────────────────────────────────────────────────────────

export const syncDayCompleteThunk = createAsyncThunk(
  'app/syncDayComplete',
  async ({ skill, day }: { skill: string; day: number }, { dispatch }) => {
    dispatch(markDayComplete({ skill, day }));
    await syncDayComplete(skill, day).catch(console.warn);
  },
);

export const saveQuizResultThunk = createAsyncThunk(
  'app/saveQuizResult',
  async (
    payload: { skill: string; day: number; score: number; total: number },
    { dispatch },
  ) => {
    dispatch(saveQuizResult(payload));
    await submitQuizResult(payload.skill, payload.day, payload.score, payload.total).catch(console.warn);
  },
);

export const saveMockResultThunk = createAsyncThunk(
  'app/saveMockResult',
  async (payload: MockTestResult, { dispatch }) => {
    dispatch(setMockTestResult(payload));
    await submitMockResult({
      score:     payload.score,
      total:     payload.total,
      accuracy:  payload.accuracy,
      timeTaken: payload.timeTaken,
      weakAreas: payload.weakAreas,
    }).catch(console.warn);
  },
);

// ─── Settings sync ─────────────────────────────────────────────────────────────

export const setSelectedPathThunk = createAsyncThunk(
  'app/setSelectedPath',
  async (path: string, { dispatch }) => {
    dispatch(setPathAction(path));
    await syncSettings({ selectedPath: path }).catch(console.warn);
  },
);

export const setSelectedSkillThunk = createAsyncThunk(
  'app/setSelectedSkill',
  async (skill: string, { dispatch }) => {
    dispatch(setSkillAction(skill));
    await syncSettings({ selectedSkill: skill }).catch(console.warn);
  },
);

export const setCurrentDayThunk = createAsyncThunk(
  'app/setCurrentDay',
  async (day: number, { dispatch }) => {
    dispatch(setCurrentDayAction(day));
    await syncSettings({ currentDay: day }).catch(console.warn);
  },
);

export const setDarkModeThunk = createAsyncThunk(
  'app/setDarkMode',
  async (v: boolean, { dispatch }) => {
    dispatch(setDarkModeAction(v));
    await syncSettings({ darkMode: v }).catch(console.warn);
  },
);

export const setNotificationsThunk = createAsyncThunk(
  'app/setNotifications',
  async (v: boolean, { dispatch }) => {
    dispatch(setNotifAction(v));
    await syncSettings({ notificationsEnabled: v }).catch(console.warn);
  },
);
