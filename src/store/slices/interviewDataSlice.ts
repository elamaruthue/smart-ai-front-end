import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { getinterViewDataApi, updateCourseSection } from '../../api/interViewData';
// import type { interViewDataPayload } from '../../api/interViewData';
// import {
//   paths      as localPaths,
//   skills     as localSkills,
//   quizBank   as localQuizBank,
//   interviewQuestions as localInterviewQs,
//   mockTestQuestions  as localMockQs,
// } from '../../data/interViewData';
// import type {
//   PathData,
//   SkillData,
//   QuizQuestion,
//   InterviewQuestion,
//   MockQuestion,
// } from '../../data/interViewData';

// ─── State ────────────────────────────────────────────────────────────────────
interface interViewDataState {
  paths:               PathData[];
  skills:              Record<string, SkillData>;
  quizBank:            Record<string, QuizQuestion[]>;
  interviewQuestions:  Record<string, Record<string, InterviewQuestion[]>>;
  mockTestQuestions:   MockQuestion[];
  loading:             boolean;
  saving:              boolean;
  error:               string | null;
  lastFetched:         number | null;
}

const initialState: interViewDataState = {
  // Seed with static data so the app works even before the API responds
  paths:               localPaths,
  skills:              localSkills,
  quizBank:            localQuizBank,
  interviewQuestions:  localInterviewQs,
  mockTestQuestions:   localMockQs,
  loading:             false,
  saving:              false,
  error:               null,
  lastFetched:         null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** Fetch all course sections from the backend API */
export const fetchinterViewData = createAsyncThunk<
  interViewDataPayload,
  void,
  { rejectValue: string }
>('interViewData/fetch', async (_, { rejectWithValue }) => {
  try {
    return await getinterViewDataApi();
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } })
      ?.response?.data?.error ?? 'Failed to load course data';
    return rejectWithValue(msg);
  }
});

/** Superadmin: save a single section back to the backend */
export const saveCourseSection = createAsyncThunk<
  { section: string; data: unknown },
  { section: string; data: unknown },
  { rejectValue: string }
>('interViewData/saveSection', async ({ section, data }, { rejectWithValue }) => {
  try {
    await updateCourseSection(section, data);
    return { section, data };
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } })
      ?.response?.data?.error ?? 'Failed to save section';
    return rejectWithValue(msg);
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const interViewDataSlice = createSlice({
  name: 'interViewData',
  initialState,
  reducers: {
    // Local optimistic update (used by the editor before the API call)
    setSectionLocal(
      state,
      action: { payload: { section: string; data: unknown } }
    ) {
      const { section, data } = action.payload;
      (state as Record<string, unknown>)[section] = data;
    },
  },

  // ── Async handlers ──────────────────────────────────────────────────────────
  extraReducers: (builder) => {
    // fetchinterViewData
    builder
      .addCase(fetchinterViewData.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchinterViewData.fulfilled, (state, action) => {
        state.loading    = false;
        state.error      = null;
        state.lastFetched = Date.now();
        // Merge API data – only replace sections that actually came back
        const p = action.payload;
        if (p.paths)               state.paths               = p.paths;
        if (p.skills)              state.skills              = p.skills;
        if (p.quizBank)            state.quizBank            = p.quizBank;
        if (p.interviewQuestions)  state.interviewQuestions  = p.interviewQuestions;
        if (p.mockTestQuestions)   state.mockTestQuestions   = p.mockTestQuestions;
      })
      .addCase(fetchinterViewData.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload ?? 'Unknown error';
        // Keep existing (static fallback) data — app stays usable
      });

    // saveCourseSection
    builder
      .addCase(saveCourseSection.pending, (state) => {
        state.saving = true;
        state.error  = null;
      })
      .addCase(saveCourseSection.fulfilled, (state, action) => {
        state.saving = false;
        const { section, data } = action.payload;
        // Commit the saved data back into the correct slice of state
        (state as Record<string, unknown>)[section] = data;
      })
      .addCase(saveCourseSection.rejected, (state, action) => {
        state.saving = false;
        state.error  = action.payload ?? 'Save failed';
      });
  },
});

export const { setSectionLocal } = interViewDataSlice.actions;
export default interViewDataSlice.reducer;
