import React, { useMemo, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Alert,
  Tabs, Tab, CircularProgress, TextField, Radio, RadioGroup,
  FormControlLabel, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, InputLabel, FormControl as MuiFormControl,
} from '@mui/material';
import AddIcon        from '@mui/icons-material/Add';
import DeleteIcon     from '@mui/icons-material/Delete';
import SaveIcon       from '@mui/icons-material/Save';
import EditIcon       from '@mui/icons-material/Edit';
import RefreshIcon    from '@mui/icons-material/Refresh';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { saveCourseSection, fetchCourseData } from '../store/slices/courseDataSlice';
import type { QuizQuestion, SkillData, DayData, MockQuestion } from '../data/courseData';

const LETTERS = ['A', 'B', 'C', 'D'];

interface QuestionForm {
  q: string;
  options: [string, string, string, string];
  answer: number;
}

const emptyForm = (): QuestionForm => ({ q: '', options: ['', '', '', ''], answer: 0 });

// Reusable dialog form for mock questions
interface FormProps {
  form: QuestionForm;
  onChange: (field: keyof QuestionForm, value: unknown) => void;
  onOptionChange: (idx: number, val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

function QuestionFormDialog({ form, onChange, onOptionChange, onSave, onCancel, saving }: FormProps) {
  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{form.q ? 'Edit Question' : 'Add Question'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth size="small" label="Question text" multiline minRows={2}
          value={form.q}
          onChange={(e) => onChange('q', e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
          {form.options.map((opt, i) => (
            <TextField
              key={i} size="small" label={`Option ${LETTERS[i]}`}
              value={opt} onChange={(e) => onOptionChange(i, e.target.value)}
            />
          ))}
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 0.5 }}>Correct Answer</Typography>
          <RadioGroup row value={form.answer} onChange={(e) => onChange('answer', Number(e.target.value))}>
            {LETTERS.map((l, i) => (
              <FormControlLabel key={i} value={i} control={<Radio size="small" />} label={l} />
            ))}
          </RadioGroup>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} onClick={onSave} disabled={saving}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DayQuizEditor() {
  // Weekly Mock Test Editor (replaces Day Quiz Editor)
  const dispatch = useAppDispatch();
  const course = useAppSelector((s) => s.courseData);
  const inter = useAppSelector((s) => s.interViewData);
  const user = useAppSelector((s) => s.auth.user);

  // Prefer admin/interview slice mockTestQuestions when present
  const rawMockQs: any[] = (inter && inter.mockTestQuestions && inter.mockTestQuestions.length > 0)
    ? inter.mockTestQuestions
    : course.mockTestQuestions ?? [];

  // Group by skill field if present, otherwise put into 'General'
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const q of rawMockQs) {
      const skill = q.skill ?? 'General';
      if (!map[skill]) map[skill] = [];
      map[skill].push(q);
    }
    return map;
  }, [rawMockQs]);

  const skillTabs = useMemo(() => Object.keys(grouped).length ? Object.keys(grouped) : ['General'], [grouped]);
  const [selectedSkill, setSelectedSkill] = useState<string>(skillTabs[0] ?? 'General');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState<QuestionForm>(emptyForm());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const role = user?.role ?? 'user';
  const canEdit = role === 'superuser' || role === 'admin';

  const questions = grouped[selectedSkill] ?? [];
  const loading = course.loading || inter?.loading;
  const saving = course.saving || inter?.saving;

  const openAdd = () => { setEditingIdx(null); setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (idx: number) => { const q = questions[idx]; setEditingIdx(idx); setForm({ q: q.q, options: q.options as [string,string,string,string], answer: q.answer }); setDialogOpen(true); };

  const handleFormChange = (field: keyof QuestionForm, value: unknown) => setForm((p) => ({ ...p, [field]: value }));
  const handleOptionChange = (idx: number, val: string) => { const opts = [...form.options] as [string,string,string,string]; opts[idx] = val; setForm((p) => ({ ...p, options: opts })); };

  const validate = () => {
    if (!form.q.trim()) { setErrorMsg('Question text required'); setTimeout(() => setErrorMsg(null), 3000); return false; }
    if (form.options.some((o) => !o.trim())) { setErrorMsg('All 4 options are required'); setTimeout(() => setErrorMsg(null), 3000); return false; }
    return true;
  };

  const persist = async (updatedArray: any[]) => {
    try {
      // flatten: replace all questions for the selected skill with updatedArray, keep others
      const remaining = rawMockQs.filter((q) => (q.skill ?? 'General') !== selectedSkill);
      const combined = [...remaining, ...updatedArray.map((q) => ({ ...q, skill: selectedSkill }))];
      const result = await dispatch(saveCourseSection({ section: 'mockTestQuestions', data: combined }));
      if (saveCourseSection.fulfilled.match(result)) {
        setSuccessMsg('Saved successfully');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      setErrorMsg('Save failed');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleSave = async () => {
    if (!validate() || !selectedSkill) return;
    const arr = [...questions];
    const payload = { q: form.q, options: form.options, answer: form.answer, skill: selectedSkill };
    if (editingIdx === null) {
      arr.push(payload);
    } else {
      arr[editingIdx] = payload;
    }
    await persist(arr);
    setDialogOpen(false);
  };

  const handleDelete = async (idx: number) => {
    const arr = questions.filter((_, i) => i !== idx);
    await persist(arr);
  };

  const handleReload = () => { dispatch(fetchCourseData()); setSuccessMsg(null); setErrorMsg(null); };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Weekly Mock Test Editor</Typography>
        <Chip label={role.toUpperCase()} size="small" sx={{ fontWeight: 700, bgcolor: role === 'superuser' ? 'error.main' : 'warning.main', color: '#fff' }} />
      </Box>

      {!canEdit && <Alert severity="warning" sx={{ mb: 2 }}>Read-only access — only admin / superuser can save changes.</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Tabs value={selectedSkill} onChange={(_, v) => { setSelectedSkill(v); }} variant="scrollable" scrollButtons="auto" sx={{ minWidth: 320 }}>
            {skillTabs.map((s) => <Tab key={s} label={s} value={s} />)}
          </Tabs>

          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReload} disabled={loading}>
            {loading ? <CircularProgress size={16} /> : 'Reload'}
          </Button>

          <Box sx={{ flex: 1 }} />

          {canEdit && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
              Add Question
            </Button>
          )}
        </CardContent>
      </Card>

      {(questions.length === 0) && (
        <Alert severity="info" sx={{ mb: 2 }}>No questions for {selectedSkill} yet.</Alert>
      )}

      {questions.map((q, idx) => (
        <Card key={idx} sx={{ mb: 1.5 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Q{idx + 1}. {q.q}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                  {(q.options ?? []).map((opt: string, i: number) => (
                    <Box key={i} sx={{ px: 1.5, py: 0.75, borderRadius: 1.5, fontSize: 13, bgcolor: i === q.answer ? '#f0fdf4' : '#f8fafc', border: `1px solid ${i === q.answer ? '#22c55e' : '#e2e8f0'}`, color: i === q.answer ? '#15803d' : '#475569', fontWeight: i === q.answer ? 700 : 400 }}>
                      {LETTERS[i]}. {opt}{i === q.answer ? '  ✓' : ''}
                    </Box>
                  ))}
                </Box>
              </Box>
              {canEdit && (
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                  <IconButton size="small" onClick={() => openEdit(idx)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(idx)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}

      {dialogOpen && (
        <QuestionFormDialog
          form={form}
          onChange={handleFormChange}
          onOptionChange={handleOptionChange}
          onSave={handleSave}
          onCancel={() => setDialogOpen(false)}
          saving={saving}
        />
      )}
    </Box>
  );
}
