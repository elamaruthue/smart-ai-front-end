import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, LinearProgress,
  Radio, RadioGroup, FormControlLabel, FormControl, Chip, Alert, CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../hooks/useProgress';
import { getQuizQuestions, DBQuestion } from '../api/quiz';

// Map letter answer to numeric index
const LETTER_TO_IDX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

interface NormalisedQuestion {
  q: string;
  options: string[];
  answer: number;          // 0-3
  explanation?: string;
}

function normalise(q: DBQuestion): NormalisedQuestion {
  return {
    q: q.question,
    options: [q.option_a, q.option_b, q.option_c, q.option_d],
    answer: LETTER_TO_IDX[q.answer] ?? 0,
    explanation: q.explanation,
  };
}

const LETTERS = ['A', 'B', 'C', 'D'];

export default function Quiz() {
  const { selectedSkill, currentDay, saveQuizResult } = useProgress();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<NormalisedQuestion[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [current, setCurrent]     = useState(0);
  const [selected, setSelected]   = useState<number | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const [answers, setAnswers]     = useState<(number | null)[]>([]);

  useEffect(() => {
    if (!selectedSkill || !currentDay) return;
    setLoading(true);
    setFetchError('');
    getQuizQuestions(selectedSkill, currentDay)
      .then((data) => {
        const normalised = data.map(normalise);
        setQuestions(normalised);
        setAnswers(Array(normalised.length).fill(null));
      })
      .catch(() => setFetchError('Failed to load questions. Please try again.'))
      .finally(() => setLoading(false));
  }, [selectedSkill, currentDay]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box>
        <Alert severity="error">{fetchError}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/learn')}>Back to Learning</Button>
      </Box>
    );
  }

  if (!questions.length) {
    return (
      <Box>
        <Alert severity="warning">No quiz available for this skill.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/learn')}>Back to Learning</Button>
      </Box>
    );
  }

  const q          = questions[current];
  const total      = questions.length;
  const progress   = ((current) / total) * 100;
  const isLast     = current === total - 1;

  const handleReveal = () => {
    if (selected === null) return;
    const updated = [...answers];
    updated[current] = selected;
    setAnswers(updated);
    setRevealed(true);
  };

  const handleNext = () => {
    setSelected(null);
    setRevealed(false);
    if (isLast) {
      const score = answers.filter((a, i) => a === questions[i]?.answer).length;
      saveQuizResult(selectedSkill!, currentDay, score, total);
      navigate('/result', { state: { score, total, skill: selectedSkill, day: currentDay } });
    } else {
      setCurrent((c) => c + 1);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Day {currentDay} Quiz 🧠</Typography>
          <Typography variant="body2" color="text.secondary">{selectedSkill}</Typography>
        </Box>
        <Chip label={`Question ${current + 1} of ${total}`} sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 700 }} />
      </Box>

      <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 8, borderRadius: 4 }} />

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
            Question {current + 1}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, mb: 3, lineHeight: 1.5 }}>
            {q.q}
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup value={selected ?? ''} onChange={(e) => !revealed && setSelected(Number(e.target.value))}>
              {q.options.map((opt, i) => {
                let bgcolor = '#f8fafc';
                let border  = '2px solid #e2e8f0';
                if (revealed) {
                  if (i === q.answer)       { bgcolor = '#f0fdf4'; border = '2px solid #22c55e'; }
                  else if (i === selected)  { bgcolor = '#fef2f2'; border = '2px solid #ef4444'; }
                } else if (selected === i) {
                  bgcolor = '#eef2ff'; border = '2px solid #4f46e5';
                }
                return (
                  <FormControlLabel
                    key={i}
                    value={i}
                    control={<Radio sx={{ display: 'none' }} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 28, height: 28, borderRadius: '50%',
                            bgcolor: selected === i && !revealed ? '#4f46e5' : revealed && i === q.answer ? '#22c55e' : '#e2e8f0',
                            color: selected === i || (revealed && i === q.answer) ? '#fff' : '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, flexShrink: 0,
                          }}
                        >
                          {LETTERS[i]}
                        </Box>
                        <Typography sx={{ fontSize: 15 }}>{opt}</Typography>
                      </Box>
                    }
                    sx={{
                      m: 0, mb: 1, p: '10px 14px', borderRadius: 2,
                      bgcolor, border, cursor: revealed ? 'default' : 'pointer',
                      width: '100%', transition: 'all .15s',
                      '&:hover': !revealed ? { borderColor: '#4f46e5' } : {},
                    }}
                    onClick={() => !revealed && setSelected(i)}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>

          {/* Explanation shown after reveal */}
          {revealed && q.explanation && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#eff6ff', borderRadius: 2, borderLeft: '4px solid #3b82f6' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1d4ed8', mb: 0.5 }}>Explanation</Typography>
              <Typography variant="body2" color="text.secondary">{q.explanation}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
        </motion.div>
      </AnimatePresence>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="outlined" onClick={() => { setCurrent((c) => Math.max(0, c - 1)); setSelected(null); setRevealed(false); }} disabled={current === 0}>
          Previous
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {!revealed ? (
            <Button variant="contained" onClick={handleReveal} disabled={selected === null}>
              Check Answer
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              {isLast ? 'Submit Quiz' : 'Next →'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
