import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button,
  LinearProgress, Chip, Radio, RadioGroup,
  FormControlLabel, FormControl,
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import { useProgress } from '../hooks/useProgress';
import { useCourseData } from '../hooks/useCourseData';
import { gradientBannerSx, statGridSx } from '../styles/common';

const TOTAL_TIME = 60 * 60;

export default function MockTest() {
  const { saveMockResult } = useProgress();
  const { mockTestQuestions } = useCourseData();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(mockTestQuestions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!started) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const score = answers.filter((a, i) => a === mockTestQuestions[i]?.answer).length;
    const total = mockTestQuestions.length;
    const accuracy = Math.round((score / total) * 100);
    const timeTaken = TOTAL_TIME - timeLeft;

    // Identify weak areas
    const skillErrors: Record<string, number> = {};
    mockTestQuestions.forEach((q, i) => {
      if (answers[i] !== q.answer) skillErrors[q.skill] = (skillErrors[q.skill] ?? 0) + 1;
    });
    const weakAreas = Object.entries(skillErrors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([s]) => s);

    saveMockResult({ score, total, accuracy, weakAreas, timeTaken });
    navigate('/mock-result');
  };

  const topicCounts = mockTestQuestions.reduce<Record<string, number>>((acc, q) => {
    acc[q.skill] = (acc[q.skill] ?? 0) + 1;
    return acc;
  }, {});

  if (!started) {
    return (
      <Box>
        <Box sx={gradientBannerSx()}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Weekly Mock Test 🧠</Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 2 }}>
            This test contains {mockTestQuestions.length} MCQ questions from all the topics you studied this week.
          </Typography>

          <Box sx={statGridSx(4)}>
            {[
              { label: 'Total Questions', value: mockTestQuestions.length },
              { label: 'Time Limit', value: '60 min' },
              { label: 'Question Type', value: 'MCQ' },
              { label: 'Topics', value: Object.keys(topicCounts).length },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2, p: 1.5, border: '1px solid rgba(255,255,255,0.15)' }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{value}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.75 }}>{label}</Typography>
              </Box>
            ))}
          </Box>

          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Topics Covered:</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 3 }}>
            {Object.entries(topicCounts).map(([skill, count]) => (
              <Box key={skill} sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1.5, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{skill}</Typography>
                <Chip label={`${count} Qs`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', height: 18, fontSize: 10 }} />
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={() => setStarted(true)}
            sx={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              fontWeight: 700,
              px: 5,
              py: 1.5,
              borderRadius: "30px",
              boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
              transition: "all 0.3s ease",

              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 24px rgba(99, 102, 241, 0.4)",
              },
            }}
          >
            Start Test
          </Button>
        </Box>
      </Box>
    );
  }

  const q = mockTestQuestions[current];
  const progress = ((current + 1) / mockTestQuestions.length) * 100;
  const isWarning = timeLeft < 600;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Weekly Mock Test 🧠</Typography>
          <Typography variant="body2" color="text.secondary">
            Q {current + 1} of {mockTestQuestions.length} · {q.skill}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 2,
            bgcolor: isWarning ? '#fef3c7' : '#fef2f2',
            border: `1px solid ${isWarning ? '#fcd34d' : '#fecaca'}`,
            color: isWarning ? '#92400e' : '#ef4444',
          }}
        >
          <TimerIcon fontSize="small" />
          <Typography sx={{ fontWeight: 800, fontSize: 18, fontFamily: "'Courier New', monospace" }}>
            {formatTime(timeLeft)}
          </Typography>
        </Box>
      </Box>

      <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 8 }} />

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip label={q.skill} size="small" sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 700 }} />
            <Typography variant="overline" color="text.secondary">Q{current + 1}</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>{q.q}</Typography>

          <FormControl fullWidth>
            <RadioGroup
              value={answers[current] ?? ''}
              onChange={(e) => {
                const updated = [...answers];
                updated[current] = Number(e.target.value);
                setAnswers(updated);
              }}
            >
              {q.options.map((opt, i) => (
                <FormControlLabel
                  key={i} value={i}
                  control={<Radio />}
                  label={opt}
                  sx={{
                    m: 0, mb: 1, px: 2, py: 1, borderRadius: 2,
                    border: answers[current] === i ? '2px solid #4f46e5' : '2px solid #e2e8f0',
                    bgcolor: answers[current] === i ? '#eef2ff' : '#f8fafc',
                    transition: 'all .15s',
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
          Previous
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {current < mockTestQuestions.length - 1 ? (
            <Button variant="contained" onClick={() => setCurrent((c) => c + 1)}>
              Next →
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Submit Test ✓
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
