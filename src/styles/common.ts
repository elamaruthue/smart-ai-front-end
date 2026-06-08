import type { SxProps, Theme } from '@mui/material';

// ── Auth pages ─────────────────────────────────────────────────────────────────

export const authPageSx: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
  p: 2,
};

export const authCardSx = (maxWidth: number): SxProps<Theme> => ({
  width: '100%',
  maxWidth,
  borderRadius: 4,
});

export const authCardContentSx: SxProps<Theme> = { p: 5 };

export const logoBoxSx: SxProps<Theme> = {
  width: 60,
  height: 60,
  borderRadius: 3,
  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  mx: 'auto',
  mb: 1.5,
};

export const submitButtonSx: SxProps<Theme> = {
  mt: 2.5,
  py: 1.5,
  fontSize: 15,
  position: 'relative',
};

export const spinnerOverlaySx: SxProps<Theme> = {
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

// ── Page layout ───────────────────────────────────────────────────────────────

/** Outer wrapper for every inner page – adds consistent bottom spacing. */
export const pageWrapSx: SxProps<Theme> = { pb: 3 };

/** Gradient page banner (e.g. MockTest intro, hero sections). */
export const gradientBannerSx = (
  from = '#4f46e5',
  to   = '#7c3aed',
): SxProps<Theme> => ({
  background: `linear-gradient(135deg, ${from}, ${to})`,
  borderRadius: 4,
  p: 4,
  mb: 3,
  color: '#fff',
});

/** Responsive stat grid. */
export const statGridSx = (cols: number = 4): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${cols}, 1fr)`,
  gap: 2,
  mb: 3,
});

/** Selectable card (path / skill selection). */
export const selectableCardSx = (selected: boolean): SxProps<Theme> => ({
  cursor: 'pointer',
  borderRadius: 3,
  border: selected ? '2px solid #4f46e5' : '2px solid #e2e8f0',
  bgcolor: selected ? '#eef2ff' : '#fff',
  transition: 'all .2s',
  '&:hover': {
    borderColor: '#4f46e5',
    boxShadow: '0 4px 20px rgba(79,70,229,0.12)',
  },
});

/** Small icon badge (used in Settings rows). */
export const iconBadgeSx: SxProps<Theme> = {
  width: 36,
  height: 36,
  borderRadius: 2,
  bgcolor: '#eef2ff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#4f46e5',
};

/** Highlighted info box (task panel, hint boxes). */
export const infoBoxSx: SxProps<Theme> = {
  bgcolor: '#eef2ff',
  border: '1px solid #c7d2fe',
  borderRadius: 2,
  p: 2,
};

/** Day bubble shared across DayLearning + Progress. */
export const dayBubbleSx = (
  done: boolean,
  active: boolean,
  locked = false,
): SxProps<Theme> => ({
  width: 34,
  height: 34,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 700,
  cursor: locked ? 'not-allowed' : 'pointer',
  bgcolor: done ? 'success.main' : active ? 'primary.main' : locked ? '#f1f5f9' : '#fff',
  color: done || active ? '#fff' : locked ? '#94a3b8' : '#64748b',
  border: done || active ? 'none' : '2px solid #e2e8f0',
  opacity: locked ? 0.5 : 1,
  transition: 'all .15s',
});
