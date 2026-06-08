import { createTheme, type Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    sidebar: { bg: string; text: string; active: string };
  }
  interface PaletteOptions {
    sidebar?: { bg: string; text: string; active: string };
  }
}

export function createDynamicTheme(darkMode: boolean): Theme {
  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#4f46e5', dark: '#3730a3', light: '#818cf8', contrastText: '#fff' },
      secondary: { main: '#06b6d4', contrastText: '#fff' },
      success: { main: '#22c55e' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      background: darkMode
        ? { default: '#0f172a', paper: '#1e293b' }
        : { default: '#f8fafc', paper: '#ffffff' },
      text: darkMode
        ? { primary: '#e2e8f0', secondary: '#94a3b8', disabled: '#475569' }
        : { primary: '#1e293b', secondary: '#64748b', disabled: '#94a3b8' },
      divider: darkMode ? '#334155' : '#e2e8f0',
      sidebar: { bg: '#1e1b4b', text: '#c7d2fe', active: '#4f46e5' },
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.5px' },
      h2: { fontWeight: 800, letterSpacing: '-0.5px' },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 12, padding: '10px 22px', fontSize: 14, fontWeight: 700 },
        },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              '&:hover': { background: 'linear-gradient(135deg, #3730a3, #6d28d9)' },
            },
          },
        ],
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(79,70,229,0.06)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { borderRadius: 16 } },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              '&:hover fieldset': { borderColor: '#4f46e5' },
              '&.Mui-focused fieldset': { borderColor: '#4f46e5', borderWidth: 2 },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 20, fontWeight: 600, fontSize: 12 } },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 5, height: 8, backgroundColor: darkMode ? '#334155' : '#e2e8f0' },
          bar: { background: 'linear-gradient(90deg, #4f46e5, #06b6d4)', borderRadius: 5 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { fontWeight: 700, fontSize: 14, textTransform: 'none' },
        },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 12 } },
      },
    },
  });
}

