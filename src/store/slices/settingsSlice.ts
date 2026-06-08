import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  darkMode: boolean;
  notificationsEnabled: boolean;
}

const initialState: SettingsState = {
  darkMode: localStorage.getItem('smartprep_dark') === 'true',
  notificationsEnabled: localStorage.getItem('smartprep_notifications') !== 'false',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
      localStorage.setItem('smartprep_dark', String(action.payload));
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
      localStorage.setItem('smartprep_notifications', String(action.payload));
    },
    hydrateSettings(state, action: PayloadAction<{ darkMode?: boolean; notificationsEnabled?: boolean }>) {
      if (action.payload.darkMode !== undefined) {
        state.darkMode = action.payload.darkMode;
        localStorage.setItem('smartprep_dark', String(action.payload.darkMode));
      }
      if (action.payload.notificationsEnabled !== undefined) {
        state.notificationsEnabled = action.payload.notificationsEnabled;
        localStorage.setItem('smartprep_notifications', String(action.payload.notificationsEnabled));
      }
    },
  },
});

export const { setDarkMode, setNotificationsEnabled, hydrateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
