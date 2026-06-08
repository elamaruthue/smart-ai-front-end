import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  LinearProgress,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReplayIcon from '@mui/icons-material/Replay';
import { useProgress } from '../hooks/useProgress';
import { gradientBannerSx, statGridSx } from '../styles/common';

export default function MockTestResult() {
  const { mockTestResult } = useProgress();
  const navigate = useNavigate();

  if (!mockTestResult) {
    return (
      <Box>
        <Typography>No mock test result found.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/mock-test')}>Take Mock Test</Button>
      </Box>
    );
  }

  const { score, total, accuracy, weakAreas, timeTaken } = mockTestResult;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  const rank = accuracy >= 90 ? 'Expert 🌟' : accuracy >= 75 ? 'Advanced 🚀' : accuracy >= 60 ? 'Intermediate 📈' : 'Beginner 🌱';
  const passed = accuracy >= 60;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={0.5}>Mock Test Result 📊</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        {passed ? 'Great Attempt! You completed the mock test.' : 'Keep practising to improve your score.'}
      </Typography>

      {/* Trophy banner */}
      <Box sx={gradientBannerSx(passed ? '#4f46e5' : '#64748b', passed ? '#7c3aed' : '#475569')}>
        <EmojiEventsIcon sx={{ fontSize: 52, mb: 1, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight={800}>{score} / {total}</Typography>
        <Typography variant="h6" sx={{ opacity: 0.85 }}>Score</Typography>
      </Box>

      {/* Stats grid */}
      <Box sx={statGridSx(2)}>
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Accuracy</Typography>
            <Typography variant="h4" fontWeight={800} color="primary.main">{accuracy}%</Typography>
            <LinearProgress variant="determinate" value={accuracy} sx={{ mt: 1 }} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Time Taken</Typography>
            <Typography variant="h4" fontWeight={800} color="secondary.main">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" color="text.secondary">out of 60:00</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Rank</Typography>
            <Typography variant="h5" fontWeight={800}>{rank}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Questions</Typography>
            <Typography variant="h5" fontWeight={800} color="success.main">{score} Correct</Typography>
            <Typography variant="body2" color="error.main">{total - score} Wrong</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography fontWeight={700} mb={1.5}>⚠️ Weak Areas</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {weakAreas.map((area) => (
                <Chip
                  key={area} label={area}
                  sx={{ bgcolor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', fontWeight: 700 }}
                />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary" mt={1.5}>
              Focus on these topics to improve your score in the next test.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<ReplayIcon />} onClick={() => navigate('/mock-test')} sx={{ px: 3 }}>
          Retake Test
        </Button>
        <Button variant="outlined" onClick={() => navigate('/interview')}>
          Review Interview Prep
        </Button>
        <Button variant="outlined" onClick={() => navigate('/progress')}>
          View Progress
        </Button>
      </Box>
    </Box>
  );
}
