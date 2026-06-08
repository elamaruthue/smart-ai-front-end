import { configureStore } from '@reduxjs/toolkit';
import authReducer       from './slices/authSlice';
import progressReducer   from './slices/progressSlice';
import settingsReducer   from './slices/settingsSlice';
import courseDataReducer from './slices/courseDataSlice';
import uiReducer         from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth:       authReducer,
    progress:   progressReducer,
    settings:   settingsReducer,
    courseData: courseDataReducer,
    ui:         uiReducer,
  },
});

export type RootState  = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
