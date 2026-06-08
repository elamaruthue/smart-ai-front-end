import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';
import { useAppSelector } from '../store/hooks';

export default function GlobalLoader() {
  const loading = useAppSelector((s) => s.ui.loading);
  const message = useAppSelector((s) => s.ui.loadingMessage);

  return (
    <Backdrop
      open={loading}
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: '#fff', flexDirection: 'column', gap: 2 }}
    >
      <CircularProgress color="inherit" size={48} thickness={4} />
      {message && (
        <Box
          sx={{
            px: 2.5, py: 1, borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)',
          }}
        >
          <Typography variant="body2" fontWeight={600} color="#fff">
            {message}
          </Typography>
        </Box>
      )}
    </Backdrop>
  );
}
