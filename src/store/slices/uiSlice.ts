import { createSlice, PayloadAction, isAnyOf } from '@reduxjs/toolkit';
import { loginThunk, registerThunk } from './authSlice';
import { fetchCourseData, saveCourseSection } from './courseDataSlice';
import {
  fetchProgressThunk,
  syncDayCompleteThunk,
  saveQuizResultThunk,
  saveMockResultThunk,
} from '../thunks';

interface UIState {
  loading: boolean;
  loadingMessage: string;
}

const initialState: UIState = {
  loading: false,
  loadingMessage: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setLoadingMessage(state, action: PayloadAction<string>) {
      state.loadingMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── Show global loader for meaningful async operations ──────────────────
    builder.addMatcher(
      isAnyOf(
        loginThunk.pending,
        registerThunk.pending,
        fetchCourseData.pending,
        saveCourseSection.pending,
        fetchProgressThunk.pending,
      ),
      (state) => { state.loading = true; },
    );

    builder.addMatcher(
      isAnyOf(
        loginThunk.fulfilled,    loginThunk.rejected,
        registerThunk.fulfilled, registerThunk.rejected,
        fetchCourseData.fulfilled,  fetchCourseData.rejected,
        saveCourseSection.fulfilled, saveCourseSection.rejected,
        fetchProgressThunk.fulfilled, fetchProgressThunk.rejected,
        // background syncs – still hide loader when they settle
        syncDayCompleteThunk.fulfilled,  syncDayCompleteThunk.rejected,
        saveQuizResultThunk.fulfilled,   saveQuizResultThunk.rejected,
        saveMockResultThunk.fulfilled,   saveMockResultThunk.rejected,
      ),
      (state) => { state.loading = false; },
    );
  },
});

export const { setLoading, setLoadingMessage } = uiSlice.actions;
export default uiSlice.reducer;
