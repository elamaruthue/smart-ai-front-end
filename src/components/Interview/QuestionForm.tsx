import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, RadioGroup, FormControlLabel, Radio, Chip
} from '@mui/material';
import type { InterviewQuestion } from '../../data/courseData';

interface Props {
  open: boolean;
  initial?: InterviewQuestion & { difficulty?: string; tags?: string[] };
  onSave: (q: InterviewQuestion & { difficulty?: string; tags?: string[] }) => void;
  onCancel: () => void;
  saving?: boolean;
}

export default function QuestionForm({ open, initial, onSave, onCancel, saving }: Props) {
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [tagsText, setTagsText] = useState('');

  useEffect(() => {
    setQ(initial?.q ?? '');
    setA(initial?.a ?? '');
    setDifficulty(initial?.difficulty ?? 'Medium');
    setTagsText((initial?.tags ?? []).join(', '));
  }, [initial, open]);

  const handleSave = () => {
    const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean);
    onSave({ q, a, difficulty, tags });
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{initial ? 'Edit Question' : 'Add Question'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Question" value={q} onChange={(e) => setQ(e.target.value)} fullWidth multiline minRows={2} />
          <TextField label="Answer" value={a} onChange={(e) => setA(e.target.value)} fullWidth multiline minRows={4} />
          <Box>
            <RadioGroup row value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <FormControlLabel value="Easy" control={<Radio />} label="Easy" />
              <FormControlLabel value="Medium" control={<Radio />} label="Medium" />
              <FormControlLabel value="Hard" control={<Radio />} label="Hard" />
            </RadioGroup>
          </Box>
          <TextField label="Tags (comma separated)" value={tagsText} onChange={(e) => setTagsText(e.target.value)} fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
