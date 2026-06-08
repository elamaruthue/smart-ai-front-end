import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Chip,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ReplayIcon from '@mui/icons-material/Replay';

interface LocationState {
  score: number;
  total: number;
  skill: string;
  day: number;
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, total = 10, skill = '', day = 1 } = (location.state as LocationState) ?? {};

  const percentage = Math.round((score / total) * 100);
  const passed     = score >= Math.ceil(total * 0.6);

  return (
    <Box sx={{ textAlign: 'center', maxWidth: 520, mx: 'auto', py: 6 }}>
      {/* Trophy */}
      <Box
        sx={{
          width: 100, height: 100, borderRadius: '50%', mx: 'auto', mb: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: passed
            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
            : 'linear-gradient(135deg, #94a3b8, #64748b)',
          boxShadow: passed ? '0 8px 30px rgba(251,191,36,0.35)' : undefined,
        }}
      >
        <EmojiEventsIcon sx={{ fontSize: 52, color: '#fff' }} />
      </Box>

      <Typography variant="h3" fontWeight={800} mb={0.5}>
        {passed ? 'Great Job! 🎉' : 'Keep Practising!'}
      </Typography>
      <Typography color="text.secondary" mb={3}>
        {skill} – Day {day} Quiz
      </Typography>

      {/* Score cards */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Score', value: `${score} / ${total}` },
          { label: 'Accuracy', value: `${percentage}%` },
          { label: 'Status', value: passed ? 'Passed ✅' : 'Failed ❌' },
        ].map(({ label, value }) => (
          <Card key={label} sx={{ minWidth: 130 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h5" fontWeight={800} color="primary.main">{value}</Typography>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Status badge */}
      <Chip
        label={passed ? '✅ Passed' : '❌ Failed'}
        sx={{
          mb: 4, px: 2, py: 1, fontSize: 15, fontWeight: 700, height: 40,
          bgcolor: passed ? '#f0fdf4' : '#fef2f2',
          color: passed ? '#22c55e' : '#ef4444',
          border: `2px solid ${passed ? '#bbf7d0' : '#fecaca'}`,
        }}
      />

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        {passed ? (
          <Button
            variant="contained" size="large" startIcon={<LockOpenIcon />}
            onClick={() => navigate('/learn')}
            sx={{ px: 4 }}
          >
            Unlock Next Day 🔓
          </Button>
        ) : (
          <Button
            variant="contained" size="large" startIcon={<ReplayIcon />}
            onClick={() => navigate('/quiz')}
            sx={{ px: 4 }}
          >
            Retry Quiz
          </Button>
        )}
        <Button variant="outlined" onClick={() => navigate('/progress')}>
          View Progress
        </Button>
      </Box>
    </Box>
  );
}
