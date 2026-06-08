import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store';
import type { RootState } from './store';
import { createDynamicTheme } from './theme';
import './index.css';
import App from './App';

/** Reads darkMode from Redux and applies the correct MUI theme */
function ThemedApp() {
  const darkMode = useSelector((s: RootState) => s.settings.darkMode);
  const theme = useMemo(() => createDynamicTheme(darkMode), [darkMode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  </StrictMode>,
);
