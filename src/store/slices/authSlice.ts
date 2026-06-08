import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { loginApi, registerApi } from '../../api/auth';

export interface User {
  username: string;
  email:    string;
  role?:    'user' | 'admin' | 'superuser';
}

interface AuthState {
  user:    User | null;
  loading: boolean;
  error:   string | null;
}

const loadUser = (): User | null => {
  try {
    const saved = localStorage.getItem('smartprep_user');
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user:    loadUser(),
  loading: false,
  error:   null,
};

// ── Async thunks ───────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk(
  'auth/loginThunk',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { user } = await loginApi(credentials.email, credentials.password);
      return user;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          (err.response?.data as { error?: string })?.error ?? 'Login failed.',
        );
      }
      return rejectWithValue('Could not connect to server. Is the backend running?');
    }
  },
);

export const registerThunk = createAsyncThunk(
  'auth/registerThunk',
  async (
    payload: { username: string; email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const { user } = await registerApi(payload.username, payload.email, payload.password);
      return user;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          (err.response?.data as { error?: string })?.error ?? 'Registration failed.',
        );
      }
      return rejectWithValue('Could not connect to server. Is the backend running?');
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginAction(state, action: PayloadAction<User>) {
      state.user = action.payload;
      localStorage.setItem('smartprep_user', JSON.stringify(action.payload));
    },
    logoutAction(state) {
      state.user = null;
      localStorage.clear();
    },
    clearAuthError(state) {
      state.error = null;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('smartprep_user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload;
        localStorage.setItem('smartprep_user', JSON.stringify(action.payload));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload;
        localStorage.setItem('smartprep_user', JSON.stringify(action.payload));
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const { loginAction, logoutAction, clearAuthError, updateUser } = authSlice.actions;
export default authSlice.reducer;
